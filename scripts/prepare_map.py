from pathlib import Path
from osgeo import gdal, ogr, osr
import numpy as np
import json, sys
from PIL import Image

gdal.UseExceptions()
root=Path(__file__).resolve().parents[1]/'map'
src=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path('map_inputs').resolve()
root.mkdir(parents=True,exist_ok=True)
lc=gdal.Warp('',str(src/'randfor_FUNC_GRP_woodycover.tif'),format='MEM',dstSRS='EPSG:3857',xRes=2.6,yRes=2.6,resampleAlg='near',dstNodata=0,outputType=gdal.GDT_Byte)
gt=lc.GetGeoTransform(); w,h=lc.RasterXSize,lc.RasterYSize
extent=[gt[0],gt[3]+h*gt[5],gt[0]+w*gt[1],gt[3]]
hs=gdal.Warp('',str(src/'veg_vis.tif'),format='MEM',dstSRS='EPSG:3857',outputBounds=extent,width=w,height=h,resampleAlg='bilinear',dstNodata=-9999)
a=lc.ReadAsArray(); shade=hs.ReadAsArray(); valid=np.isfinite(shade)&(shade>-2)
lo,hi=np.percentile(shade[valid],[2,98]); gray=np.uint8(np.clip((shade-lo)/(hi-lo),0,1)*220+25)
colors={1:'#329b99',2:'#414548',3:'#e58b32',4:'#ffffff',5:'#f2cbd8'}
def png(name,arr):
 ds=gdal.GetDriverByName('MEM').Create('',w,h,arr.shape[0],gdal.GDT_Byte)
 for i,x in enumerate(arr):ds.GetRasterBand(i+1).WriteArray(x)
 ds.GetRasterBand(arr.shape[0]).SetColorInterpretation(gdal.GCI_AlphaBand)
 gdal.GetDriverByName('PNG').CreateCopy(str(root/name),ds,options=['ZLEVEL=9'])
rgba=np.zeros((4,h,w),dtype='uint8')
for val,color in colors.items():
 for b in range(3):rgba[b][a==val]=int(color[1+b*2:3+b*2],16)
rgba[3]=np.where(a>0,255,0)
png('landcover.png',rgba)
png('hillshade.png',np.stack([gray,gray,gray,np.where(valid,255,0).astype('uint8')]))
target=osr.SpatialReference();target.ImportFromEPSG(4326);target.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
merc=osr.SpatialReference();merc.ImportFromEPSG(3857);merc.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
tr=osr.CoordinateTransformation(merc,target)
sw=tr.TransformPoint(extent[0],extent[1]);ne=tr.TransformPoint(extent[2],extent[3])
ds=ogr.Open(str(src/'GIS032/GIS032.shp'));layer=ds.GetLayer();source=layer.GetSpatialRef();source.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
tr=osr.CoordinateTransformation(source,target);features=[]
for f in layer:
 geom=f.GetGeometryRef().Clone();geom.Transform(tr)
 features.append({'type':'Feature','properties':{'name':f.GetField('NAME_1') or 'Unnamed watershed'},'geometry':json.loads(geom.ExportToJson())})
geo={'type':'FeatureCollection','features':features}
(root/'watersheds.geojson').write_text(json.dumps(geo,separators=(',',':')))
config={'bounds':[[sw[1],sw[0]],[ne[1],ne[0]]],'colors':colors,'watersheds':geo}
(root/'data.js').write_text('window.KONZA_DATA = '+json.dumps(config,separators=(',',':'))+';\n')
(root/'processing.json').write_text(json.dumps({'source_landcover_resolution_m':2,'display_web_mercator_pixel_m':2.6,'categorical_resampling':'nearest neighbor','hillshade_resampling':'bilinear','hillshade_display_stretch':[float(lo),float(hi)],'display_dimensions':[w,h],'watershed_features':len(features)},indent=2))
print('Map prepared',w,h,'watersheds',len(features),'shade',lo,hi)
for p in root.glob('*.png'): print(p.name,p.stat().st_size)

Image.open(root/'hillshade.png').save(root/'hillshade.webp',quality=88,method=6)
(root/'hillshade.png').unlink()

# Preserve editable treatment labels and corrected grazing perimeters on rebuild.
import csv
if (root/'watershed_treatments.csv').exists():
    lookup={row['watershed']:row for row in csv.DictReader((root/'watershed_treatments.csv').open())}
    for feature in config['watersheds']['features']:
        row=lookup.get(feature['properties']['name'])
        if row: feature['properties'].update(fire=row['long_term_interval'],fire_note=row['note'],grazer=row['grazer'])
if (root/'grazers.geojson').exists(): config['grazers']=json.loads((root/'grazers.geojson').read_text())
(root/'data.js').write_text('window.KONZA_DATA = '+json.dumps(config,separators=(',',':'))+';\n')

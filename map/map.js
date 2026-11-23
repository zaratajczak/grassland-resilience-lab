(function () {
  let map;
  window.initKonzaMap = function () {
    const element = document.getElementById('konza-map');
    if (!element || element.offsetWidth === 0 || !window.L || !window.KONZA_DATA) return;
    if (map) { map.invalidateSize(); return; }
    element.replaceChildren();
    const data = window.KONZA_DATA;
    map = L.map(element, {scrollWheelZoom:false, minZoom:12, maxZoom:19, attributionControl:true});
    map.createPane('vegetationTexture').style.zIndex = 200;
    map.createPane('landCover').style.zIndex = 300;
    map.createPane('watershedOutlines').style.zIndex = 400;
    const assets = window.KONZA_ASSETS || {hillshade:'map/hillshade.webp', landcover:'map/landcover.png'};
    const hillshade = L.imageOverlay(assets.hillshade, data.bounds, {pane:'vegetationTexture', attribution:'LiDAR canopy hillshade: supplied veg_vis layer'}).addTo(map);
    const landcover = L.imageOverlay(assets.landcover, data.bounds, {pane:'landCover', opacity:0.75, className:'categorical-raster', attribution:'Land cover: Noble & Ratajczak (2025)'}).addTo(map);
    const watersheds = L.geoJSON(data.watersheds, {
      pane:'watershedOutlines',
      style:{color:'#212829',weight:1,opacity:0.95,fillColor:'#ffffff',fillOpacity:0},
      onEachFeature(feature, layer) {
        const name = document.createElement('span'); name.textContent = feature.properties.name+' · Long-term fire interval: '+feature.properties.fire;
        layer.bindTooltip(name, {sticky:true});
        const popup = document.createElement('div');
        const title = document.createElement('strong');title.textContent = 'Watershed '+feature.properties.name;
        popup.append(title,document.createElement('br'),document.createTextNode('Long-term fire interval: '+feature.properties.fire),document.createElement('br'),document.createTextNode('Grazing: '+feature.properties.grazer));
        const note=document.createElement('p');note.textContent=feature.properties.fire_note;popup.append(note);
        layer.bindPopup(popup);
        layer.on('mouseover',()=>layer.setStyle({weight:3}));
        layer.on('mouseout',()=>layer.setStyle({weight:1}));
      }
    }).addTo(map);
    map.createPane('grazingPerimeters').style.zIndex = 450;
    map.getPane('grazingPerimeters').style.pointerEvents = 'none';
    const grazing = L.layerGroup([
      L.geoJSON(data.grazers,{pane:'grazingPerimeters',interactive:false,style:{color:'#fff',weight:5,fill:false,opacity:0.85}}),
      L.geoJSON(data.grazers,{pane:'grazingPerimeters',interactive:false,style:f=>({color:f.properties.grazer==='Bison'?'#8d238b':'#1459bd',weight:2.8,fill:false,opacity:1,dashArray:f.properties.grazer==='Bison'?null:'9 6'})})
    ]).addTo(map);
    const bounds = L.latLngBounds(data.bounds);
    function reset(){map.fitBounds(bounds,{padding:[20,20]});}
    map.setMaxBounds(bounds.pad(0.5));
    map.options.maxBoundsViscosity = 0.8;
    reset();
    L.control.scale({imperial:false,position:'bottomleft',maxWidth:130}).addTo(map);
    [['grazing',grazing],['watersheds',watersheds],['landcover',landcover],['hillshade',hillshade]].forEach(([id,layer])=>{
      document.getElementById('map-'+id).addEventListener('change',e=>e.target.checked?layer.addTo(map):map.removeLayer(layer));
    });
    document.getElementById('map-transparency').addEventListener('input',e=>{
      landcover.setOpacity(1-Number(e.target.value)/100);
      document.getElementById('map-transparency-value').value = e.target.value+'%';
    });
    document.getElementById('map-reset').addEventListener('click',reset);
    [hillshade,landcover].forEach(layer=>layer.on('error',()=>{
      document.querySelector('.map-hint').textContent='A map image could not load. Please reload this page.';
    }));
    window.addEventListener('resize',()=>map.invalidateSize());
  };
  window.addEventListener('hashchange',()=>requestAnimationFrame(window.initKonzaMap));
  requestAnimationFrame(window.initKonzaMap);
})();

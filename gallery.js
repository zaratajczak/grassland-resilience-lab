
document.documentElement.dataset.palette='green';


const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.carousel').forEach(c=>{
 const track=c.querySelector('.carousel-track'), slides=[...c.querySelectorAll('.carousel-slide')], status=c.querySelector('.position'),play=c.querySelector('.play');
 let index=0, paused=reduced.matches, hover=false,focused=false,visible=false,last=Date.now();
 slides.forEach((s,i)=>{s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');s.setAttribute('aria-label',`${i+1} of ${slides.length}`);});
 c.classList.add('ready');c.querySelector('.carousel-controls').hidden=false;
 function update(manual=false){track.style.transform=`translateX(-${index*100}%)`;slides.forEach((s,i)=>{s.setAttribute('aria-hidden',i!==index);s.inert=i!==index;s.style.visibility='visible';const v=s.querySelector('video');if(v&&i!==index)v.pause();});status.setAttribute('aria-live',manual?'polite':'off');status.textContent=`${index+1} / ${slides.length}`;play.textContent=paused?'Play slideshow':'Pause slideshow';last=Date.now();}
 function move(d){index=(index+d+slides.length)%slides.length;update(true);}
 c.querySelector('.prev').onclick=()=>move(-1);c.querySelector('.next').onclick=()=>move(1);
 play.onclick=()=>{paused=!paused;update(true);};
 c.addEventListener('mouseenter',()=>hover=true);c.addEventListener('mouseleave',()=>{hover=false;last=Date.now();});
 c.addEventListener('focusin',()=>focused=true);c.addEventListener('focusout',()=>setTimeout(()=>{focused=c.contains(document.activeElement);last=Date.now();},0));
 c.addEventListener('keydown',e=>{if(e.target.tagName==='VIDEO')return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=Date.now();},{threshold:.15}).observe(c);
 reduced.addEventListener('change',e=>{if(e.matches){paused=true;update();}});
 setInterval(()=>{const v=slides[index].querySelector('video');if(!paused&&!hover&&!focused&&visible&&!document.hidden&&(!v||v.paused)&&Date.now()-last>=10000){index=(index+1)%slides.length;update();}},500);update();
});



const current=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.sidebar nav a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page');});

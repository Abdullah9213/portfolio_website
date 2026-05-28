import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";

// ── PHOTO (embedded) ──────────────────────────────────────────────────────────
const PHOTO = "/profile.png";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg:   "#04040a",
  bg1:  "#08080f",
  bg2:  "#0d0d18",
  bg3:  "#121220",
  glow: "rgba(255,200,60,0.18)",
  glowS:"rgba(255,200,60,0.07)",
  border:"rgba(255,255,255,0.055)",
  borderH:"rgba(255,200,60,0.35)",
  text: "#f2f0eb",
  text2:"#8a8880",
  text3:"#3a3835",
  gold: "#FFB800",
  goldL:"#FFD060",
  goldD:"#CC8800",
  red:  "#ff453a",
  green:"#34c759",
  blue: "#0a84ff",
};

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=satoshi@400,500,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${T.bg};color:${T.text};overflow-x:hidden;font-family:'Satoshi',sans-serif}
*{cursor:none!important}
::selection{background:${T.gold};color:#000}
::-webkit-scrollbar{width:1px}
::-webkit-scrollbar-track{background:${T.bg}}
::-webkit-scrollbar-thumb{background:${T.gold}}
a{text-decoration:none;color:inherit}
.mono{font-family:'IBM Plex Mono',monospace}
.fraunces{font-family:'Fraunces',serif}
.clash{font-family:'Clash Display',sans-serif}
.satoshi{font-family:'Satoshi',sans-serif}

@keyframes grain2{
  0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}
  20%{transform:translate(1%,2%)}30%{transform:translate(-1%,1%)}
  40%{transform:translate(2%,-1%)}50%{transform:translate(-2%,2%)}
  60%{transform:translate(1%,-2%)}70%{transform:translate(-1%,3%)}
  80%{transform:translate(2%,1%)}90%{transform:translate(-2%,-1%)}
}
@keyframes shimmer{
  0%{transform:translateX(-100%)}
  100%{transform:translateX(200%)}
}
@keyframes scandown{
  0%{top:-4px;opacity:0}
  5%{opacity:1}
  95%{opacity:0.6}
  100%{top:100%;opacity:0}
}
`;

// ── SPRING CONFIGS ─────────────────────────────────────────────────────────────
const SNAP   = {stiffness:600,damping:45};
const SMOOTH = {stiffness:120,damping:18};
const SOFT   = {stiffness:80, damping:22};

// ── CUSTOM CURSOR ─────────────────────────────────────────────────────────────
function Cursor(){
  const cx=useMotionValue(-200), cy=useMotionValue(-200);
  const sx=useSpring(cx,SNAP),   sy=useSpring(cy,SNAP);
  const rx=useSpring(cx,SMOOTH), ry=useSpring(cy,SMOOTH);
  const [state,setState]=useState("default");

  useEffect(()=>{
    const mv=e=>{cx.set(e.clientX);cy.set(e.clientY)};
    const mo=e=>{
      const el=e.target;
      if(el.closest("[data-cur='link']"))setState("link");
      else if(el.closest("[data-cur='photo']"))setState("photo");
      else setState("default");
    };
    window.addEventListener("mousemove",mv);
    window.addEventListener("mouseover",mo);
    return()=>{window.removeEventListener("mousemove",mv);window.removeEventListener("mouseover",mo)};
  },[]);

  const isLink=state==="link";
  const isPhoto=state==="photo";

  return(
    <>
      {/* dot */}
      <motion.div style={{
        position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:9999,
        x:useTransform(sx,v=>v-4), y:useTransform(sy,v=>v-4),
        width:8,height:8,borderRadius:"50%",
        background:isPhoto?"transparent":T.gold,
        border:isPhoto?`1px solid ${T.gold}`:"none",
        transition:"background 0.2s,border 0.2s",
      }}/>
      {/* ring */}
      <motion.div
        animate={{
          width: isPhoto?120:isLink?44:28,
          height:isPhoto?120:isLink?44:28,
          borderColor:isLink||isPhoto?T.gold:"rgba(255,184,0,0.3)",
          x: useTransform(rx,v=>v-(isPhoto?60:isLink?22:14)),
          y: useTransform(ry,v=>v-(isPhoto?60:isLink?22:14)),
        }}
        transition={{duration:0.25}}
        style={{
          position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:9998,
          borderRadius:"50%",
          border:`1px solid rgba(255,184,0,0.3)`,
          x:useTransform(rx,v=>v-14),
          y:useTransform(ry,v=>v-14),
          width:28,height:28,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
        {isPhoto&&<span className="mono" style={{fontSize:"0.55rem",color:T.gold,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>VIEW</span>}
      </motion.div>
    </>
  );
}

// ── LOADER ────────────────────────────────────────────────────────────────────
function Loader({onDone}){
  const [progress,setProgress]=useState(0);
  const [phase,setPhase]=useState(0); // 0=counting, 1=text reveal, 2=exit
  const name="ABDULLAH GHAFFAR";

  useEffect(()=>{
    // count to 100
    let p=0;
    const id=setInterval(()=>{
      p+=Math.random()*4+1;
      if(p>=100){p=100;clearInterval(id);setPhase(1);setTimeout(()=>{setPhase(2);setTimeout(onDone,900)},1200);}
      setProgress(Math.floor(p));
    },35);
    return()=>clearInterval(id);
  },[]);

  return(
    <AnimatePresence>
      {phase<2&&(
        <motion.div
          key="loader"
          exit={{y:"-100%"}}
          transition={{duration:0.85,ease:[0.76,0,0.24,1]}}
          style={{
            position:"fixed",inset:0,zIndex:10000,
            background:T.bg,
            display:"flex",flexDirection:"column",
            justifyContent:"space-between",
            padding:"2.5rem",
            overflow:"hidden",
          }}>

          {/* Grain */}
          <div style={{
            position:"absolute",inset:"-50%",opacity:0.04,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation:"grain2 0.4s steps(1) infinite",
            pointerEvents:"none",
          }}/>

          {/* Top: logo */}
          <div className="mono" style={{fontSize:"0.75rem",color:T.text3,letterSpacing:"0.2em"}}>AG.DEV / 2026</div>

          {/* Center: giant name decode */}
          <div style={{flex:1,display:"flex",alignItems:"center"}}>
            <div>
              {name.split("").map((ch,i)=>(
                <motion.span
                  key={i}
                  className="clash"
                  initial={{opacity:0}}
                  animate={{opacity:1}}
                  transition={{delay:i*0.04,duration:0.1}}
                  style={{
                    fontSize:"clamp(3rem,9vw,8rem)",
                    fontWeight:900,
                    letterSpacing:"-0.04em",
                    lineHeight:0.9,
                    color: phase===1
                      ? i<8 ? T.text : T.gold
                      : T.text3,
                    display:"inline-block",
                    transition:"color 0.3s ease",
                    transitionDelay:`${i*0.04}s`,
                    whiteSpace: ch===" "?"pre":undefined,
                  }}>
                  {ch}
                </motion.span>
              ))}
              <motion.div
                initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
                className="mono"
                style={{fontSize:"0.72rem",color:T.gold,letterSpacing:"0.25em",marginTop:"1.5rem",textTransform:"uppercase"}}>
                Backend · AI Systems · Automation
              </motion.div>
            </div>
          </div>

          {/* Bottom: progress */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <span className="mono" style={{fontSize:"0.65rem",color:T.text3,letterSpacing:"0.1em"}}>INITIALISING</span>
              <span className="mono" style={{fontSize:"0.65rem",color:T.gold}}>{progress}%</span>
            </div>
            <div style={{height:"1px",background:T.border,position:"relative",overflow:"hidden",borderRadius:1}}>
              <motion.div
                animate={{width:`${progress}%`}}
                transition={{duration:0.1}}
                style={{
                  position:"absolute",top:0,left:0,height:"100%",
                  background:`linear-gradient(90deg,${T.goldD},${T.gold},${T.goldL})`,
                }}/>
              {/* shimmer on bar */}
              <div style={{
                position:"absolute",inset:0,
                background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)`,
                animation:"shimmer 1.5s infinite",
              }}/>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav(){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",h);
    return()=>window.removeEventListener("scroll",h);
  },[]);
  return(
    <motion.nav
      initial={{y:-80,opacity:0}}
      animate={{y:0,opacity:1}}
      transition={{delay:0.2,duration:0.8,ease:[0.16,1,0.3,1]}}
      style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"1.25rem 2.5rem",
        background:scrolled?"rgba(4,4,10,0.9)":"transparent",
        borderBottom:scrolled?`1px solid ${T.border}`:"1px solid transparent",
        backdropFilter:scrolled?"blur(24px)":"none",
        transition:"all 0.4s",
      }}>
      <span className="mono" style={{fontSize:"0.75rem",color:T.gold,letterSpacing:"0.1em"}}>AG.DEV</span>
      <div style={{display:"flex",gap:"2.5rem"}}>
        {["Work","Experience","Skills","Contact"].map(l=>(
          <motion.a key={l} href={`#${l.toLowerCase()}`} data-cur="link"
            className="mono" whileHover={{color:T.gold}}
            style={{fontSize:"0.68rem",color:T.text2,letterSpacing:"0.12em",textTransform:"uppercase",transition:"color 0.2s"}}>
            {l}
          </motion.a>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
        <motion.div animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:2}}
          style={{width:6,height:6,borderRadius:"50%",background:T.green}}/>
        <span className="mono" style={{fontSize:"0.62rem",color:T.text2}}>Available Jun 2026</span>
      </div>
    </motion.nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero(){
  const {scrollY}=useScroll();
  const y=useTransform(scrollY,[0,700],[0,-140]);
  const op=useTransform(scrollY,[0,500],[1,0]);
  const photoScale=useTransform(scrollY,[0,400],[1,1.06]);

  // magnetic on name
  const mx=useMotionValue(0),my=useMotionValue(0);
  const smx=useSpring(mx,SOFT),smy=useSpring(my,SOFT);
  const [hovName,setHovName]=useState(false);
  const nameRef=useRef(null);
  const onNameMove=useCallback(e=>{
    if(!nameRef.current)return;
    const r=nameRef.current.getBoundingClientRect();
    mx.set((e.clientX-r.left-r.width/2)*0.12);
    my.set((e.clientY-r.top-r.height/2)*0.12);
  },[]);
  const onNameLeave=()=>{mx.set(0);my.set(0);setHovName(false)};

  // role ticker
  const roles=["Backend Engineer","AI Systems Builder","RAG Pipeline Architect","Automation Engineer","Full Stack Developer"];
  const [ri,setRi]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setRi(i=>(i+1)%roles.length),2400);return()=>clearInterval(t)},[]);

  return(
    <motion.section style={{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"flex-end",y,opacity:op}}>

      {/* GRAIN */}
      <div style={{position:"absolute",inset:"-50%",zIndex:0,opacity:0.038,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation:"grain2 0.45s steps(1) infinite",pointerEvents:"none"}}/>

      {/* SUBTLE GRID */}
      <div style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,
        backgroundSize:"100px 100px",
        maskImage:"radial-gradient(ellipse 80% 80% at 15% 85%,black 20%,transparent 80%)",
      }}/>

      {/* GLOW behind photo */}
      <div style={{position:"absolute",right:"5%",top:"10%",width:"50vw",height:"80vh",zIndex:0,
        background:`radial-gradient(ellipse at 60% 40%,${T.glow} 0%,transparent 65%)`,
        pointerEvents:"none"}}/>

      {/* SCANLINE on photo area */}
      <div style={{position:"absolute",right:"5%",top:"10%",width:"38vw",height:"80vh",zIndex:1,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{
          position:"absolute",left:0,right:0,height:"3px",
          background:`linear-gradient(transparent,rgba(255,184,0,0.15),transparent)`,
          animation:"scandown 4s linear infinite",
        }}/>
      </div>

      {/* PHOTO — right-aligned, tall, slight clip */}
      <motion.div
        data-cur="photo"
        style={{
          position:"absolute",right:"5%",top:"8%",
          width:"clamp(280px,36vw,520px)",
          height:"85vh",
          zIndex:2,
          overflow:"hidden",
          clipPath:"polygon(0 0,100% 0,100% 100%,8% 100%)",
          scale:photoScale,
        }}>
        {/* Glitch layers */}
        <motion.img
          src={PHOTO}
          alt="Abdullah Ghaffar"
          animate={{x:[0,2,0,-2,0],opacity:[1,0.95,1]}}
          transition={{repeat:Infinity,duration:6,ease:"easeInOut"}}
          style={{
            width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",
            filter:"contrast(1.05) brightness(0.88)",
            display:"block",
          }}/>
        {/* Gold tint overlay */}
        <div style={{
          position:"absolute",inset:0,
          background:`linear-gradient(135deg,rgba(255,184,0,0.06) 0%,transparent 60%,rgba(0,0,0,0.5) 100%)`,
          mixBlendMode:"normal",
        }}/>
        {/* CRT scanlines */}
        <div style={{
          position:"absolute",inset:0,
          backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)`,
          pointerEvents:"none",
        }}/>
        {/* Left edge fade */}
        <div style={{
          position:"absolute",inset:0,
          background:`linear-gradient(90deg,${T.bg} 0%,transparent 18%)`,
          pointerEvents:"none",
        }}/>
        {/* Bottom fade */}
        <div style={{
          position:"absolute",inset:0,
          background:`linear-gradient(0deg,${T.bg} 0%,transparent 30%)`,
          pointerEvents:"none",
        }}/>
      </motion.div>

      {/* HERO CONTENT — left-aligned, overlapping photo */}
      <div style={{position:"relative",zIndex:3,padding:"0 2.5rem 5rem",maxWidth:"65vw"}}>

        {/* Eyebrow */}
        <motion.div
          initial={{opacity:0,x:-20}}
          animate={{opacity:1,x:0}}
          transition={{delay:0.1,duration:0.7,ease:[0.16,1,0.3,1]}}
          style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"2rem"}}>
          <div style={{width:28,height:1,background:T.gold}}/>
          <span className="mono" style={{fontSize:"0.68rem",color:T.gold,letterSpacing:"0.2em",textTransform:"uppercase"}}>
            Software Engineer · Islamabad, PK · Class of 2026
          </span>
        </motion.div>

        {/* GIANT NAME with magnetic effect */}
        <motion.div
          ref={nameRef}
          onMouseMove={onNameMove}
          onMouseLeave={onNameLeave}
          onMouseEnter={()=>setHovName(true)}
          style={{x:smx,y:smy,marginBottom:"2.5rem"}}>

          <motion.h1
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.15}}
            className="clash"
            style={{lineHeight:0.88,letterSpacing:"-0.04em"}}>
            <motion.span
              initial={{y:80,opacity:0}}
              animate={{y:0,opacity:1}}
              transition={{delay:0.2,duration:0.9,ease:[0.16,1,0.3,1]}}
              style={{display:"block",fontSize:"clamp(4.5rem,12vw,11rem)",fontWeight:900,color:T.text}}>
              ABDULLAH
            </motion.span>
            <motion.span
              initial={{y:80,opacity:0}}
              animate={{y:0,opacity:1}}
              transition={{delay:0.32,duration:0.9,ease:[0.16,1,0.3,1]}}
              style={{
                display:"block",
                fontSize:"clamp(4.5rem,12vw,11rem)",fontWeight:900,
                WebkitTextStroke:`2px ${T.gold}`,
                color:"transparent",
                letterSpacing:"-0.04em",
              }}>
              GHAFFAR
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Role ticker */}
        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{delay:0.6,duration:0.7}}
          style={{marginBottom:"2.5rem"}}>
          <div className="mono" style={{fontSize:"0.6rem",color:T.text3,letterSpacing:"0.15em",marginBottom:"0.4rem"}}>
            CURRENTLY FOCUSED ON
          </div>
          <div style={{overflow:"hidden",height:"2.2rem"}}>
            <AnimatePresence mode="wait">
              <motion.div
                key={ri}
                initial={{y:40,opacity:0}}
                animate={{y:0,opacity:1}}
                exit={{y:-40,opacity:0}}
                transition={{duration:0.4,ease:[0.16,1,0.3,1]}}
                className="fraunces"
                style={{fontSize:"1.6rem",fontWeight:700,fontStyle:"italic",color:T.gold,lineHeight:1.3}}>
                {roles[ri]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Desc + CTAs */}
        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{delay:0.75,duration:0.7}}>
          <p className="satoshi" style={{fontSize:"0.88rem",color:T.text2,lineHeight:1.75,maxWidth:440,marginBottom:"2rem"}}>
            I build backend systems, AI pipelines, and automation workflows that
            actually ship — load-tested under real load, delivered to paying clients,
            maintained with care.
          </p>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <GoldButton href="#work" filled>View Projects</GoldButton>
            <GoldButton href="mailto:abdullah.gheffer@gmail.com">Get In Touch</GoldButton>
          </div>
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{opacity:0}}
        animate={{opacity:1}}
        transition={{delay:1.5}}
        style={{position:"absolute",bottom:"2.5rem",right:"2.5rem",zIndex:4,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem"}}>
        <span className="mono" style={{writingMode:"vertical-rl",fontSize:"0.6rem",color:T.text3,letterSpacing:"0.15em"}}>SCROLL</span>
        <motion.div
          animate={{scaleY:[1,0.25,1]}}
          transition={{repeat:Infinity,duration:1.8,ease:"easeInOut"}}
          style={{width:1,height:40,background:`linear-gradient(${T.gold},transparent)`,transformOrigin:"top"}}/>
      </motion.div>
    </motion.section>
  );
}

// ── GOLD BUTTON ───────────────────────────────────────────────────────────────
function GoldButton({children,href,filled}){
  const mx=useMotionValue(0),my=useMotionValue(0);
  const smx=useSpring(mx,SOFT),smy=useSpring(my,SOFT);
  const ref=useRef(null);
  const onMove=e=>{
    if(!ref.current)return;
    const r=ref.current.getBoundingClientRect();
    mx.set((e.clientX-r.left-r.width/2)*0.3);
    my.set((e.clientY-r.top-r.height/2)*0.3);
  };
  const onLeave=()=>{mx.set(0);my.set(0)};
  return(
    <motion.a href={href} ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} data-cur="link"
      style={{x:smx,y:smy,display:"inline-block"}}
      whileTap={{scale:0.96}}>
      <motion.div
        whileHover={{scale:1.04}}
        className="mono"
        style={{
          fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",
          padding:"0.85rem 1.75rem",borderRadius:"3px",
          background:filled?T.gold:"transparent",
          color:filled?"#000":T.text2,
          border:filled?"none":`1px solid rgba(255,255,255,0.12)`,
          fontWeight:filled?700:400,
          transition:"color 0.2s,border-color 0.2s",
          position:"relative",overflow:"hidden",
        }}>
        {!filled&&(
          <motion.div
            initial={{x:"-100%",opacity:0}}
            whileHover={{x:"100%",opacity:[0,0.15,0]}}
            transition={{duration:0.5}}
            style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`}}/>
        )}
        {children}
      </motion.div>
    </motion.a>
  );
}

// ── STATS ────────────────────────────────────────────────────────────────────
function Stats(){
  const stats=[
    {n:"22.5K",l:"Users Served",s:"FYPilot platform"},
    {n:"<$0.03",l:"Per AI Run",s:"ContraGuard AI"},
    {n:"70%",l:"Overhead Cut",s:"Admin automation"},
    {n:"<25s",l:"Full Analysis",s:"6-agent pipeline"},
    {n:"33%",l:"Latency Drop",s:"Redis caching"},
    {n:"85%",l:"Match Accuracy",s:"Semantic similarity"},
  ];
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-80px"});
  return(
    <section style={{padding:"0 2.5rem 7rem",maxWidth:1200,margin:"0 auto"}}>
      <div ref={ref} style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",
        borderTop:`1px solid ${T.border}`,borderLeft:`1px solid ${T.border}`}}>
        {stats.map((s,i)=>(
          <motion.div key={i}
            initial={{opacity:0,y:16}}
            animate={inView?{opacity:1,y:0}:{}}
            transition={{delay:i*0.08,duration:0.6,ease:[0.16,1,0.3,1]}}
            style={{padding:"2rem 1.5rem",borderRight:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
            <div className="clash" style={{fontSize:"2.2rem",fontWeight:800,color:T.gold,lineHeight:1,marginBottom:"0.4rem"}}>{s.n}</div>
            <div className="mono" style={{fontSize:"0.68rem",color:T.text,marginBottom:"0.2rem",letterSpacing:"0.04em"}}>{s.l}</div>
            <div className="mono" style={{fontSize:"0.58rem",color:T.text3}}>{s.s}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── TILT CARD ────────────────────────────────────────────────────────────────
function TiltCard({children,featured}){
  const ref=useRef(null);
  const rx=useMotionValue(0),ry=useMotionValue(0);
  const srx=useSpring(rx,{stiffness:180,damping:28});
  const sry=useSpring(ry,{stiffness:180,damping:28});
  const [hov,setHov]=useState(false);
  const inView=useInView(ref,{once:true,margin:"-60px"});

  const onMove=e=>{
    if(!ref.current)return;
    const r=ref.current.getBoundingClientRect();
    rx.set(-((e.clientY-r.top)/r.height-0.5)*7);
    ry.set(((e.clientX-r.left)/r.width-0.5)*7);
  };
  const onLeave=()=>{rx.set(0);ry.set(0);setHov(false)};

  return(
    <motion.div ref={ref}
      initial={{opacity:0,y:36}}
      animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:0.7,ease:[0.16,1,0.3,1]}}
      onMouseMove={onMove}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX:srx,rotateY:sry,
        transformStyle:"preserve-3d",perspective:1200,
        background:T.bg2,
        border:`1px solid ${hov?T.borderH:T.border}`,
        borderRadius:"6px",
        position:"relative",overflow:"hidden",
        transition:"border-color 0.3s",
        gridColumn:featured?"1 / -1":undefined,
      }}>
      {/* Hover shimmer */}
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:0.3}}
        style={{position:"absolute",inset:0,pointerEvents:"none",
          background:`radial-gradient(ellipse 60% 50% at 50% -10%,${T.glowS},transparent 70%)`}}/>
      {/* Top edge sweep */}
      <motion.div animate={{scaleX:hov?1:0}} transition={{duration:0.35}}
        style={{position:"absolute",top:0,left:0,right:0,height:"1px",
          background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,
          transformOrigin:"left"}}/>
      {children(hov)}
    </motion.div>
  );
}

// ── PROJECT SECTION ───────────────────────────────────────────────────────────
function Work(){
  const PROJECTS=[
    {
      name:"FYPilot",
      tag:"Final Year Project · Production Ready",
      tagline:"AI-enhanced FYP management for FAST-NUCES — 22,500 students, zero tolerance for manual process.",
      metrics:["2 months → minutes","85% match accuracy","70% overhead cut","Artillery load-tested"],
      stack:["Python","FastAPI","React","OR-Tools CP-SAT","FAISS","PostgreSQL","Redis","PM2","Docker","GitHub Actions","LangChain"],
      bullets:[
        "OR-Tools CP-SAT constraint optimisation replaced a 2-month manual panel assignment process — baseline measured directly from academic officers under NDA.",
        "FAISS semantic similarity + novelty ensemble detects paraphrased duplicate proposals. Validated at 85% match. Admin overhead cut 70%.",
        "Polyglot persistence (PostgreSQL + Redis) + PM2 cluster mode. Artillery stress-tested under thousands of concurrent users.",
        "CI/CD via GitHub Actions: test → Docker build → staged deploy. Production-ready, pending university management sign-off.",
      ],
      featured:true,
    },
    {
      name:"ContraGuard AI",
      tag:"Multi-agent LLM system",
      tagline:"6-agent contract risk analysis. Under 25 seconds. Under $0.03.",
      metrics:["<25s end-to-end","<$0.03 / run","33% latency reduction","15% fewer LLM calls"],
      stack:["LangChain","BERT/RoBERTa","ChromaDB","Redis","Celery","Tesseract OCR","FastAPI","Docker"],
    },
    {
      name:"Mandi Express",
      tag:"MLOps pipeline",
      tagline:"Full automated price prediction pipeline for every Pakistani mandi. Live monitoring.",
      metrics:["Nationwide coverage","Live drift detection","Continuous retraining"],
      stack:["Airflow","MLflow","DVC","AWS S3","Prometheus","Grafana","GitHub Actions","Docker"],
    },
    {
      name:"Maze Lab",
      tag:"DSA showcase",
      tagline:"The full DSA syllabus in one C++ codebase. Human vs AI mode.",
      metrics:["A* pathfinding","MST generation","Dual gameplay"],
      stack:["C++","OOP","A*","MST","Graph Traversal","STL"],
    },
  ];

  return(
    <section id="work" style={{padding:"0 2.5rem 8rem",maxWidth:1200,margin:"0 auto"}}>
      <SLabel label="Selected Work"/>
      <STitle lines={["Things I've built","that actually ship."]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:T.border,
        border:`1px solid ${T.border}`,borderRadius:"6px",overflow:"hidden"}}>
        {PROJECTS.map((p,i)=>(
          <div key={i} style={{background:T.bg,gridColumn:p.featured?"1/-1":undefined}}>
            <TiltCard featured={p.featured}>
              {hov=>(
                <div style={{padding:p.featured?"3rem 3rem":"2rem",display:p.featured?"grid":undefined,
                  gridTemplateColumns:p.featured?"1fr 1fr":undefined,gap:p.featured?"3.5rem":undefined}}>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.25rem"}}>
                      <span className="mono" style={{fontSize:"0.58rem",color:T.text3,letterSpacing:"0.2em"}}>{String(i+1).padStart(2,"0")}</span>
                      <span className="mono" style={{fontSize:"0.58rem",padding:"0.2rem 0.55rem",borderRadius:"2px",
                        background:T.glowS,color:T.gold,border:`1px solid rgba(255,184,0,0.2)`}}>{p.tag}</span>
                    </div>
                    <h3 className="clash" style={{fontSize:p.featured?"2.4rem":"1.55rem",fontWeight:800,
                      letterSpacing:"-0.02em",marginBottom:"0.6rem",color:T.text}}>{p.name}</h3>
                    <p className="satoshi" style={{fontSize:"0.83rem",color:T.text2,lineHeight:1.65,marginBottom:"1.25rem"}}>{p.tagline}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"1.5rem"}}>
                      {p.metrics.map((m,mi)=>(
                        <span key={mi} className="mono" style={{fontSize:"0.62rem",padding:"0.25rem 0.55rem",borderRadius:"2px",
                          background:mi===0?T.glowS:"rgba(255,255,255,0.04)",
                          color:mi===0?T.gold:T.text2,
                          border:`1px solid ${mi===0?"rgba(255,184,0,0.18)":T.border}`}}>{m}</span>
                      ))}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>
                      {p.stack.map((s,si)=>(
                        <span key={si} className="mono" style={{fontSize:"0.58rem",color:T.text3,
                          padding:"0.18rem 0.45rem",border:`1px solid ${T.border}`,borderRadius:"2px"}}>{s}</span>
                      ))}
                    </div>
                  </div>
                  {p.featured&&p.bullets&&(
                    <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"0.9rem",paddingTop:"0.5rem"}}>
                      {p.bullets.map((b,bi)=>(
                        <li key={bi} style={{display:"flex",gap:"0.75rem"}}>
                          <span className="mono" style={{color:T.gold,fontSize:"0.65rem",flexShrink:0,marginTop:"0.18rem"}}>→</span>
                          <span className="satoshi" style={{fontSize:"0.82rem",color:T.text2,lineHeight:1.65}}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── EXPERIENCE ────────────────────────────────────────────────────────────────
function Experience(){
  const EXP=[
    {
      date:"Jan 2026 – May 2026",co:"Accessory Kingz",loc:"Remote · Sharjah, UAE",
      role:"Software Engineer (Contract)",
      bullets:[
        "Sole engineer on a greenfield WMS. Architected and delivered the full system, performing deep refactoring across service layers with system-wide regression coverage after every structural change.",
        "Custom modules for inventory, HRM, order processing, profit monitoring with UAE-specific business logic.",
        "Cut operator data-entry time ~10% by automating redundant steps. Delivered on schedule with full handover docs.",
      ],
    },
    {
      date:"Jul 2025 – Aug 2025",co:"Foowin Living",loc:"Remote · via SSMarketing",
      role:"Web Developer (Contract)",
      bullets:[
        "Converted a static contact page into a fully automated SMTP-based inquiry routing system — eliminated 100% of missed customer messages.",
        "Improved session retention and SEO via navbar redesign, content truncation, and deliberate blog-to-product CTAs.",
      ],
    },
    {
      date:"Aug 2022 – Jun 2026",co:"FAST-NUCES",loc:"Islamabad, Pakistan",
      role:"B.S. Software Engineering",
      bullets:[
        "Coursework: Software Architecture · OS · DSA · DB Systems · Networks · Applied AI · MLOps · GenAI · InfoSec · Formal Methods · BPE · Process Mining.",
        "Runner-up, NASCON 2025 SE Quiz — 2nd of 50+ teams nationwide.",
        "NASCON 2024 Hackathon — built 3D interactive EdTech prototype with Spline + Framer Motion.",
      ],
    },
  ];
  return(
    <section id="experience" style={{padding:"0 2.5rem 8rem",maxWidth:1200,margin:"0 auto"}}>
      <SLabel label="Experience"/>
      <STitle lines={["Real clients.","Real systems."]}/>
      {EXP.map((e,i)=>{
        const ref=useRef(null);
        const inView=useInView(ref,{once:true,margin:"-60px"});
        return(
          <motion.div key={i} ref={ref}
            initial={{opacity:0,x:-24}}
            animate={inView?{opacity:1,x:0}:{}}
            transition={{delay:i*0.1,duration:0.7,ease:[0.16,1,0.3,1]}}
            style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:"3rem",
              padding:"2.5rem 0",borderBottom:`1px solid ${T.border}`}}>
            <div>
              <div className="mono" style={{fontSize:"0.62rem",color:T.text3,marginBottom:"0.45rem",letterSpacing:"0.05em"}}>{e.date}</div>
              <div className="mono" style={{fontSize:"0.76rem",color:T.gold,marginBottom:"0.25rem"}}>{e.co}</div>
              <div className="mono" style={{fontSize:"0.6rem",color:T.text3}}>{e.loc}</div>
            </div>
            <div>
              <div className="clash" style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"1rem",letterSpacing:"-0.01em"}}>{e.role}</div>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"0.55rem"}}>
                {e.bullets.map((b,bi)=>(
                  <li key={bi} style={{display:"flex",gap:"0.7rem"}}>
                    <span className="mono" style={{color:T.gold,fontSize:"0.6rem",flexShrink:0,marginTop:"0.22rem"}}>▸</span>
                    <span className="satoshi" style={{fontSize:"0.82rem",color:T.text2,lineHeight:1.65}}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}

// ── SKILLS ───────────────────────────────────────────────────────────────────
function Skills(){
  const G=[
    {l:"Languages",   i:["Python","C++","TypeScript","JavaScript","SQL","Java","Bash","C#"]},
    {l:"Backend",     i:["FastAPI","Node.js","REST APIs","Microservices","Celery","WebSockets","LangChain"]},
    {l:"AI / ML",     i:["RAG Pipelines","BERT/RoBERTa","FAISS","ChromaDB","PyTorch","LLM Integration","OR-Tools CP-SAT","Sentence Transformers","YOLO","OpenCV"]},
    {l:"Databases",   i:["PostgreSQL","Redis","ChromaDB","SQLite","Schema Design","Query Optimisation"]},
    {l:"DevOps",      i:["Docker","GitHub Actions","AWS S3/ECS/Lambda","PM2","Airflow","MLflow","DVC","Prometheus","Grafana"]},
    {l:"Frontend",    i:["React 18","TypeScript","Tailwind CSS","Figma","HTML/CSS"]},
    {l:"Automation",  i:["n8n","SMTP Pipelines","Webhook Flows","API Integrations","Celery","CML"]},
    {l:"Engineering", i:["System Design","OOP","Design Patterns","TDD","pytest","Artillery","A*","Graph Algorithms"]},
  ];
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-80px"});
  return(
    <section id="skills" style={{padding:"0 2.5rem 8rem",maxWidth:1200,margin:"0 auto"}}>
      <SLabel label="Technical Skills"/>
      <STitle lines={["The full stack."]}/>
      <div ref={ref} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",
        border:`1px solid ${T.border}`,borderRadius:"6px",overflow:"hidden"}}>
        {G.map((g,gi)=>(
          <motion.div key={gi}
            initial={{opacity:0}}
            animate={inView?{opacity:1}:{}}
            transition={{delay:gi*0.07,duration:0.5}}
            style={{padding:"1.75rem",background:T.bg,
              borderRight:(gi+1)%4!==0?`1px solid ${T.border}`:"none",
              borderBottom:gi<4?`1px solid ${T.border}`:"none"}}>
            <div className="mono" style={{fontSize:"0.58rem",color:T.gold,letterSpacing:"0.2em",
              textTransform:"uppercase",marginBottom:"1rem"}}>{g.l}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>
              {g.i.map((item,ii)=>(
                <motion.span key={ii} whileHover={{color:T.gold,borderColor:T.borderH,background:T.glowS}}
                  className="mono"
                  style={{fontSize:"0.66rem",color:T.text2,padding:"0.25rem 0.52rem",
                    border:`1px solid ${T.border}`,borderRadius:"2px",transition:"all 0.2s",cursor:"default"}}>
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────────
function Contact(){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-80px"});
  const links=[
    {icon:"✉",label:"Email",val:"abdullah.gheffer@gmail.com",href:"mailto:abdullah.gheffer@gmail.com"},
    {icon:"gh",label:"GitHub",val:"github.com/Abdullah9213",href:"https://github.com/Abdullah9213"},
    {icon:"in",label:"LinkedIn",val:"linkedin.com/in/abdullah-ghaffar--",href:"https://linkedin.com/in/abdullah-ghaffar--"},
    {icon:"↗",label:"Portfolio",val:"abdullahghaffar.dev",href:"https://abdullahghaffar.dev"},
    {icon:"☎",label:"Phone",val:"+92 318-0687481",href:"tel:+923180687481"},
  ];
  return(
    <section id="contact" style={{borderTop:`1px solid ${T.border}`,padding:"8rem 2.5rem"}}>
      <div ref={ref} style={{maxWidth:1200,margin:"0 auto",display:"grid",
        gridTemplateColumns:"1fr 1fr",gap:"7rem",alignItems:"center"}}>
        <div>
          <SLabel label="Contact"/>
          <motion.h2 className="clash"
            initial={{opacity:0,y:24}}
            animate={inView?{opacity:1,y:0}:{}}
            transition={{duration:0.8,ease:[0.16,1,0.3,1]}}
            style={{fontSize:"clamp(3rem,6vw,5rem)",fontWeight:900,lineHeight:1,
              letterSpacing:"-0.03em",marginBottom:"1.5rem"}}>
            Let's build<br/>
            <span style={{WebkitTextStroke:`2px ${T.gold}`,color:"transparent"}}>something</span><br/>
            real.
          </motion.h2>
          <motion.p className="satoshi"
            initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:0.2,duration:0.7}}
            style={{fontSize:"0.87rem",color:T.text2,lineHeight:1.75,marginBottom:"2rem"}}>
            Open to full-time roles, long-term contracts, and serious freelance projects.
            If you need someone who ships and thinks about the outcome — not just the ticket — reach out.
          </motion.p>
          <div style={{display:"flex",flexDirection:"column",gap:"0.55rem"}}>
            {links.map((l,i)=>(
              <motion.a key={i} href={l.href} target="_blank" data-cur="link"
                initial={{opacity:0,x:-16}}
                animate={inView?{opacity:1,x:0}:{}}
                transition={{delay:i*0.08+0.25,duration:0.5}}
                whileHover={{x:6,borderColor:T.borderH}}
                style={{display:"flex",alignItems:"center",gap:"1rem",
                  padding:"0.85rem 1rem",border:`1px solid ${T.border}`,
                  borderRadius:"3px",transition:"border-color 0.2s"}}>
                <span className="mono" style={{fontSize:"0.6rem",color:T.gold,width:18}}>{l.icon}</span>
                <span className="mono" style={{fontSize:"0.6rem",color:T.text3,width:70,letterSpacing:"0.1em"}}>{l.label}</span>
                <span className="mono" style={{fontSize:"0.7rem",color:T.text2}}>{l.val}</span>
              </motion.a>
            ))}
          </div>
        </div>

        <motion.div
          initial={{opacity:0,y:24}}
          animate={inView?{opacity:1,y:0}:{}}
          transition={{delay:0.15,duration:0.7}}
          style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"2.5rem",position:"relative",overflow:"hidden"}}>
          {/* Corner glow */}
          <div style={{position:"absolute",top:0,right:0,width:150,height:150,
            background:`radial-gradient(circle at top right,${T.glowS},transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"2rem"}}>
            <motion.div animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:2}}
              style={{width:7,height:7,borderRadius:"50%",background:T.green}}/>
            <span className="mono" style={{fontSize:"0.66rem",color:T.green,letterSpacing:"0.1em"}}>
              Available for new work — June 2026
            </span>
          </div>
          {[
            ["Location","Islamabad, Pakistan"],
            ["Timezone","UTC+5"],
            ["Preferred Role","Backend / AI Engineer"],
            ["Open To","Full-time · Contract · Remote"],
            ["Graduating","June 2026"],
            ["Response Time","Within 24 hours"],
          ].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"0.72rem 0",borderBottom:`1px solid ${T.border}`}}>
              <span className="mono" style={{fontSize:"0.62rem",color:T.text3}}>{k}</span>
              <span className="mono" style={{fontSize:"0.68rem",color:T.text}}>{v}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────────────────
function Footer(){
  return(
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"2rem 2.5rem",
      display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span className="mono" style={{fontSize:"0.62rem",color:T.text3}}>© 2026 Abdullah Ghaffar</span>
      <span className="mono" style={{fontSize:"0.62rem",color:T.text3}}>
        Built from scratch · <span style={{color:T.gold}}>No templates</span>
      </span>
    </footer>
  );
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function SLabel({label}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true});
  return(
    <motion.div ref={ref}
      initial={{opacity:0,x:-16}} animate={inView?{opacity:1,x:0}:{}} transition={{duration:0.5}}
      style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
      <div style={{width:20,height:1,background:T.gold}}/>
      <span className="mono" style={{fontSize:"0.62rem",color:T.gold,letterSpacing:"0.2em",textTransform:"uppercase"}}>{label}</span>
    </motion.div>
  );
}
function STitle({lines}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-60px"});
  return(
    <div ref={ref} style={{marginBottom:"3.5rem"}}>
      {lines.map((line,i)=>(
        <motion.div key={i}
          initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.1,duration:0.7,ease:[0.16,1,0.3,1]}}
          className="clash"
          style={{fontSize:"clamp(2.2rem,4.5vw,3.8rem)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.025em"}}>
          {line}
        </motion.div>
      ))}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [loaded,setLoaded]=useState(false);
  return(
    <>
      <style>{GCSS}</style>
      <Cursor/>
      <Loader onDone={()=>setLoaded(true)}/>
      {loaded&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}}>
          <Nav/>
          <Hero/>
          <Stats/>
          <Work/>
          <Experience/>
          <Skills/>
          <Contact/>
          <Footer/>
        </motion.div>
      )}
    </>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";

// ── PHOTO (embedded) ──────────────────────────────────────────────────────────
const PHOTO = "data:image/png;base64,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";

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
                    fontSize:"clamp(3.5rem,10vw,9rem)",
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
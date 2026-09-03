import{E as e,S as t,_ as n,d as r,g as i,h as a,k as o,t as s,v as c,w as l}from"./index-Bepnbj6n.js";var u=o(e(),1),d=l();function f({standard:e,onPick:o,shared:l}){let[f,p]=(0,u.useState)(l??null),[m,h]=(0,u.useState)(!1);(0,u.useEffect)(()=>{if(l){p(l);return}let e=!0;return h(!1),p(null),Promise.allSettled(s.map(e=>c(e.latitude,e.longitude))).then(t=>{if(!e)return;let n=t.map((e,t)=>e.status===`fulfilled`&&e.value?{city:s[t],current:e.value}:null).filter(Boolean);n.length?p(n):h(!0)}),()=>{e=!1}},[l]);let g=a[e].index;if(m)return null;if(!f)return(0,d.jsxs)(`div`,{className:`card`,children:[(0,d.jsx)(`div`,{className:`card-head`,children:(0,d.jsx)(`h3`,{children:`Rang-lista gradova`})}),(0,d.jsx)(t,{height:220})]});let _=[...f].sort((e,t)=>(e.current[g]??999)-(t.current[g]??999)),v=Math.max(..._.map(e=>e.current[g]??0),1);return(0,d.jsxs)(`div`,{className:`card`,children:[(0,d.jsx)(`div`,{className:`card-head`,children:(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h3`,{children:`Rang-lista gradova`}),(0,d.jsxs)(`div`,{className:`card-sub`,children:[`Praćeni gradovi, sortirano po trenutnom `,e===`us`?`US`:`EU`,` AQI`]})]})}),(0,d.jsx)(`ol`,{className:`rank-list`,children:_.map((t,a)=>{let s=t.current[g],c=i(e,s);return(0,d.jsx)(`li`,{children:(0,d.jsxs)(`button`,{className:`rank-row`,onClick:()=>o(t.city),type:`button`,children:[(0,d.jsx)(`span`,{className:`rank-pos faint`,children:a+1}),(0,d.jsxs)(`span`,{className:`rank-name`,children:[t.city.name,(0,d.jsxs)(`span`,{className:`faint`,children:[` · `,t.city.country]})]}),(0,d.jsx)(`span`,{className:`rank-bar-wrap`,children:(0,d.jsx)(`span`,{className:`rank-bar`,style:{width:`${(s??0)/v*100}%`,background:n(e,s)}})}),(0,d.jsx)(`span`,{className:`rank-val tnum`,style:{color:c.color},children:r(s,0)})]})},t.city.name)})}),(0,d.jsx)(`style`,{children:`
        .rank-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px; }
        .rank-row {
          width:100%; display:grid; grid-template-columns: 22px 1fr 90px 42px;
          align-items:center; gap:10px; background:transparent; border:0; cursor:pointer;
          padding:7px 8px; border-radius:8px; text-align:left; color:var(--text); font-size:0.88rem;
        }
        .rank-row:hover { background:var(--surface-2); }
        .rank-pos { font-size:0.8rem; text-align:center; }
        .rank-name { font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rank-bar-wrap { height:8px; background:var(--surface-inset); border-radius:999px; overflow:hidden; }
        .rank-bar { display:block; height:100%; border-radius:999px; transition:width .5s ease; }
        .rank-val { text-align:right; font-weight:800; }
        @media (max-width:520px){
          .rank-row { grid-template-columns: 20px 1fr 42px; }
          .rank-bar-wrap { display:none; }
        }
      `})]})}export{f as default};
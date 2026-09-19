import{c as e,h as t,i as n,m as r,o as i,u as a,v as o}from"./format-CpTOzhiv.js";import{h as s,t as c}from"./index-fP-S2QFI.js";var l=o(t(),1),u=r();function d({standard:t,onPick:r,shared:o}){let[d,f]=(0,l.useState)(`worst`),p=i[t].index;if(!o)return(0,u.jsxs)(`div`,{className:`card`,children:[(0,u.jsx)(`div`,{className:`card-head`,children:(0,u.jsx)(`h3`,{children:`Rang-lista praćenih gradova`})}),(0,u.jsx)(s,{height:220})]});let m=[...o.filter(e=>e.current?.[p]!=null)].sort((e,t)=>e.current[p]-t.current[p]),h=d===`worst`?[...m].reverse().slice(0,10):m.slice(0,10),g=Math.max(...h.map(e=>e.current[p]??0),1);return(0,u.jsxs)(`div`,{className:`card`,children:[(0,u.jsx)(`div`,{className:`card-head`,children:(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h3`,{children:`Rang-lista praćenih gradova`}),(0,u.jsxs)(`div`,{className:`card-sub`,children:[`Od `,c.length,` unapred izabranih gradova (ne svih gradova sveta) · trenutni`,` `,t===`us`?`US`:`EU`,` AQI`]})]})}),(0,u.jsxs)(`div`,{className:`segmented`,style:{marginBottom:12},children:[(0,u.jsx)(`button`,{type:`button`,className:d===`worst`?`active`:``,onClick:()=>f(`worst`),children:`Najzagađeniji`}),(0,u.jsx)(`button`,{type:`button`,className:d===`best`?`active`:``,onClick:()=>f(`best`),children:`Najčistiji`})]}),(0,u.jsx)(`ol`,{className:`rank-list`,children:h.map((i,o)=>{let s=i.current[p],c=e(t,s);return(0,u.jsx)(`li`,{children:(0,u.jsxs)(`button`,{className:`rank-row`,onClick:()=>r(i.city),type:`button`,children:[(0,u.jsx)(`span`,{className:`rank-pos faint`,children:o+1}),(0,u.jsxs)(`span`,{className:`rank-name`,children:[i.city.name,(0,u.jsxs)(`span`,{className:`faint`,children:[` · `,i.city.country]})]}),(0,u.jsx)(`span`,{className:`rank-bar-wrap`,children:(0,u.jsx)(`span`,{className:`rank-bar`,style:{width:`${(s??0)/g*100}%`,background:a(t,s)}})}),(0,u.jsx)(`span`,{className:`rank-val tnum`,style:{color:c.color},children:n(s,0)})]})},i.city.name+i.city.latitude)})}),(0,u.jsx)(`style`,{children:`
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
      `})]})}export{d as default};
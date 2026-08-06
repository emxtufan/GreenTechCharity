var er=Object.defineProperty;var Fe=(t,e)=>{for(var r in e)er(t,r,{get:e[r],enumerable:!0})};var w={heading1:"heading1",heading2:"heading2",heading3:"heading3",heading4:"heading4",heading5:"heading5",heading6:"heading6",paragraph:"paragraph",preformatted:"preformatted",strong:"strong",em:"em",listItem:"list-item",oListItem:"o-list-item",list:"group-list-item",oList:"group-o-list-item",image:"image",embed:"embed",hyperlink:"hyperlink",label:"label",span:"span"};var Oe=t=>Array.isArray(t)?`[${t.map(Oe).join(", ")}]`:typeof t=="string"?`"${t}"`:t instanceof Date?`${t.getTime()}`:`${t}`,d=t=>(r,...o)=>{let i=o.map(Oe).join(", "),n=r&&o.length?", ":"";return`[${t}(${r}${n}${i})]`},qe=t=>{let e=d(t);return o=>e(o)},tr=t=>{let e=d(t);return(...o)=>e("",...o)},_={at:d("at"),not:d("not"),any:d("any"),in:d("in"),fulltext:d("fulltext"),has:qe("has"),missing:qe("missing"),similar:tr("similar"),geopointNear:d("geopoint.near"),numberLessThan:d("number.lt"),numberGreaterThan:d("number.gt"),numberInRange:d("number.inRange"),dateAfter:d("date.after"),dateBefore:d("date.before"),dateBetween:d("date.between"),dateDayOfMonth:d("date.day-of-month"),dateDayOfMonthAfter:d("date.day-of-month-after"),dateDayOfMonthBefore:d("date.day-of-month-before"),dateDayOfWeek:d("date.day-of-week"),dateDayOfWeekAfter:d("date.day-of-week-after"),dateDayOfWeekBefore:d("date.day-of-week-before"),dateMonth:d("date.month"),dateMonthAfter:d("date.month-after"),dateMonthBefore:d("date.month-before"),dateYear:d("date.year"),dateHour:d("date.hour"),dateHourAfter:d("date.hour-after"),dateHourBefore:d("date.hour-before")};var U=t=>Array.isArray(t)?t:[t];var u=(t={},e)=>({...t,filters:[...t.filters||[],...U(e)]});var De=t=>typeof t=="function"?t:()=>t;var ee="7.16.1";var be=t=>`https://prismic.dev/msg/client/v${ee}/${t}`;var ye=t=>_.at("document.tags",U(t));var rr=Object.defineProperty,or=(t,e,r)=>e in t?rr(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,He=(t,e,r)=>or(t,typeof e!="symbol"?e+"":e,r),f=class extends Error{constructor(e="An invalid API response was returned",r,o){super(e),He(this,"url"),He(this,"response"),this.url=r,this.response=o}};var q=(t,e)=>{let r=t.find(o=>e(o));if(!r)throw new f("Ref could not be found.",void 0,void 0);return r};var xe=t=>q(t,e=>e.isMasterRef);var te=(t,e)=>q(t,r=>r.id===e);var re=(t,e)=>q(t,r=>r.label===e);var oe={};Fe(oe,{preview:()=>we});var we="io.prismic.preview";var Ce=t=>t.replace(/%3B/g,";"),ze=t=>{let e=t.split("; "),r;for(let o of e){let i=o.split("=");if(Ce(i[0]).replace(/%3D/g,"=")===we){r=Ce(i.slice(1).join("="));break}}return r};var Ze=t=>t.replace(/(\n| )*( |{|})(\n| )*/gm,(e,r,o)=>o);var C=t=>_.any("document.tags",U(t));var E=t=>_.at("document.type",t);var S=class extends f{};var $=class extends f{};var ie=class extends f{};var ne=class extends S{};var z=class extends S{};var O=class extends S{};var ae=class extends ${};var k={Any:"Any",Document:"Document",Media:"Media",Web:"Web"};var Ge=t=>{var e;return{link_type:k.Document,id:t.id,uid:t.uid||void 0,type:t.type,tags:t.tags,lang:t.lang,url:t.url==null?void 0:t.url,slug:(e=t.slugs)==null?void 0:e[0],...t.data&&Object.keys(t.data).length>0?{data:t.data}:{}}};var P=(t,...e)=>{if(!t)return null;let r="link_type"in t?t:Ge(t),[o]=e,i;switch(typeof o=="function"||o==null?i={linkResolver:o}:i={...o},r.link_type){case k.Media:case k.Web:return"url"in r?r.url:null;case k.Document:{if("id"in r&&i.linkResolver){let n=i.linkResolver(r);if(n!=null)return n}return"url"in r&&r.url?r.url:null}case k.Any:default:return null}};var ir=t=>new Promise(e=>setTimeout(e,t)),Be=({interval:t}={})=>{let e=[],r=!1,o=0,i=()=>{var c;!r&&e.length>0&&((c=e.shift())==null||c(),r=!0)},n=()=>{r=!1,i()},a=async(c,l,m)=>{let p=Date.now()-o;t&&p<t&&await ir(t-p);let I=(async()=>c(...m))();l(I);try{await I}catch{}o=Date.now(),n()},s=(c,l,m)=>{new Promise(p=>{e.push(p)}).then(a.bind(void 0,c,l,m)),(async()=>(await Promise.resolve(),r||i()))()};return(c,...l)=>new Promise(m=>{s(c,m,l)})};var nr=Object.defineProperty,ar=(t,e,r)=>e in t?nr(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,se=(t,e,r)=>ar(t,typeof e!="symbol"?e+"":e,r),sr=1500,ce=class{constructor(e){if(se(this,"fetchFn"),se(this,"fetchOptions"),se(this,"queuedFetchJobs",{}),se(this,"dedupedFetchJobs",{}),this.fetchOptions=e.fetchOptions,typeof e.fetch=="function")this.fetchFn=e.fetch;else if(typeof globalThis.fetch=="function")this.fetchFn=globalThis.fetch;else throw new f("A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.",void 0,void 0);this.fetchFn===globalThis.fetch&&(this.fetchFn=this.fetchFn.bind(globalThis))}async fetch(e,r={}){var o,i,n,a,s;let c={...this.fetchOptions,...r.fetchOptions,headers:{...(o=this.fetchOptions)==null?void 0:o.headers,...(i=r.fetchOptions)==null?void 0:i.headers},signal:((n=r.fetchOptions)==null?void 0:n.signal)||r.signal||((a=this.fetchOptions)==null?void 0:a.signal)};return(s=r.fetchOptions)!=null&&s.body?this.queueFetch(e,c):this.dedupeFetch(e,c)}queueFetch(e,r={}){let o=new URL(e).hostname;return this.queuedFetchJobs[o]||(this.queuedFetchJobs[o]=Be({interval:sr})),this.queuedFetchJobs[o](()=>this.createFetchJob(e,r))}dedupeFetch(e,r={}){let o;return this.dedupedFetchJobs[e]&&this.dedupedFetchJobs[e].has(r.signal)?o=this.dedupedFetchJobs[e].get(r.signal):(this.dedupedFetchJobs[e]=this.dedupedFetchJobs[e]||new Map,o=this.createFetchJob(e,r).finally(()=>{var i,n;(i=this.dedupedFetchJobs[e])==null||i.delete(r.signal),((n=this.dedupedFetchJobs[e])==null?void 0:n.size)===0&&delete this.dedupedFetchJobs[e]}),this.dedupedFetchJobs[e].set(r.signal,o)),o}createFetchJob(e,r={}){return this.fetchFn(e,r).then(async o=>{let i,n;if(o.ok)try{i=await o.json()}catch{}else try{n=await o.text(),i=JSON.parse(n)}catch{}return{status:o.status,headers:o.headers,json:i,text:n}})}};var cr="x-c",lr={accessToken:"access_token"},dr=t=>typeof t=="string"?t:t.direction==="desc"?`${t.field} desc`:t.field,Qe=(t,e)=>{let{filters:r,predicates:o,...i}=e,n=new URL("documents/search",`${t}/`);if(r)for(let a of U(r))n.searchParams.append("q",`[${a}]`);if(o)for(let a of U(o))n.searchParams.append("q",`[${a}]`);for(let a in i){let s=lr[a]||a,c=i[a];if(s==="orderings"){let l=i[s];l!=null&&(c=`[${U(l).map(p=>dr(p)).join(",")}]`)}else s==="routes"&&typeof i[s]=="object"&&(c=JSON.stringify(U(i[s])));c!=null&&n.searchParams.set(s,U(c).join(","))}return n.searchParams.set(cr,`js-${ee}`),n.toString()};var Ye=t=>/^[a-zA-Z0-9][-a-zA-Z0-9]{2,}[a-zA-Z0-9]$/.test(t);var Je=t=>{if(Ye(t))return`https://${t}.cdn.prismic.io/api/v2`;throw new f(`An invalid Prismic repository name was given: ${t}`,void 0,void 0)};var Ke=t=>{try{let e=new URL(t).hostname;if(e.endsWith("prismic.io")||e.endsWith("wroom.io")||e.endsWith("wroom.test"))return e.split(".")[0]}catch{}throw new f(`An invalid Prismic Document API endpoint was provided: ${t}`,void 0,void 0)};var Ue=t=>{try{return new URL(t),!0}catch{return!1}};var mr=Object.defineProperty,tt=t=>{throw TypeError(t)},pr=(t,e,r)=>e in t?mr(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,W=(t,e,r)=>pr(t,typeof e!="symbol"?e+"":e,r),rt=(t,e,r)=>e.has(t)||tt("Cannot "+r),et=(t,e,r)=>(rt(t,e,"read from private field"),r?r.call(t):e.get(t)),fr=(t,e,r)=>e.has(t)?tt("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),ur=(t,e,r,o)=>(rt(t,e,"write to private field"),o?o.call(t,r):e.set(t,r),r),Z,hr=100,gr=5e3,vr=500,_r=1e3,br=3,V;(function(t){t.Master="Master",t.ReleaseID="ReleaseID",t.ReleaseLabel="ReleaseLabel",t.Manual="Manual"})(V||(V={}));var le=class extends ce{constructor(e,r={}){if(super(r),fr(this,Z),W(this,"documentAPIEndpoint"),W(this,"accessToken"),W(this,"routes"),W(this,"brokenRoute"),W(this,"defaultParams"),W(this,"refState",{mode:V.Master,autoPreviewsEnabled:!0}),W(this,"cachedRepository"),W(this,"cachedRepositoryExpiration",0),r.documentAPIEndpoint||Ue(e),Ue(e)){this.documentAPIEndpoint=e;try{this.repositoryName=Ke(e)}catch{console.warn(`[@prismicio/client] A repository name could not be inferred from the provided endpoint (\`${e}\`). Some methods will be disabled. Create the client using a repository name to prevent this warning. For more details, see ${be("prefer-repository-name")}`)}}else this.documentAPIEndpoint=r.documentAPIEndpoint||Je(e),this.repositoryName=e;this.accessToken=r.accessToken,this.routes=r.routes,this.brokenRoute=r.brokenRoute,this.defaultParams=r.defaultParams,r.ref&&this.queryContentFromRef(r.ref),this.graphQLFetch=this.graphQLFetch.bind(this)}set repositoryName(e){ur(this,Z,e)}get repositoryName(){if(!et(this,Z))throw new f(`A repository name is required for this method but one could not be inferred from the provided API endpoint (\`${this.documentAPIEndpoint}\`). To fix this error, provide a repository name when creating the client. For more details, see ${be("prefer-repository-name")}`,void 0,void 0);return et(this,Z)}set endpoint(e){this.documentAPIEndpoint=e}get endpoint(){return this.documentAPIEndpoint}enableAutoPreviews(){this.refState.autoPreviewsEnabled=!0}enableAutoPreviewsFromReq(e){this.refState.httpRequest=e,this.refState.autoPreviewsEnabled=!0}disableAutoPreviews(){this.refState.autoPreviewsEnabled=!1}async get(e){let{data:r}=await this._get(e);return r}async getFirst(e){var r;let o={...e};!(e&&e.page)&&!e?.pageSize&&(o.pageSize=((r=this.defaultParams)==null?void 0:r.pageSize)??1);let{data:i,url:n}=await this._get(o),a=i.results[0];if(a)return a;throw new $("No documents were returned",n,void 0)}async dangerouslyGetAll(e={}){var r;let{limit:o=1/0,...i}=e,n={...i,pageSize:Math.min(o,i.pageSize||((r=this.defaultParams)==null?void 0:r.pageSize)||hr)},a=[],s;for(;(!s||s.next_page)&&a.length<o;){let c=s?s.page+1:void 0;s=await this.get({...n,page:c}),a.push(...s.results),s.next_page&&await new Promise(l=>setTimeout(l,vr))}return a.slice(0,o)}async getByID(e,r){return await this.getFirst(u(r,_.at("document.id",e)))}async getByIDs(e,r){return await this.get(u(r,_.in("document.id",e)))}async getAllByIDs(e,r){return await this.dangerouslyGetAll(u(r,_.in("document.id",e)))}async getByUID(e,r,o){return await this.getFirst(u(o,[E(e),_.at(`my.${e}.uid`,r)]))}async getByUIDs(e,r,o){return await this.get(u(o,[E(e),_.in(`my.${e}.uid`,r)]))}async getAllByUIDs(e,r,o){return await this.dangerouslyGetAll(u(o,[E(e),_.in(`my.${e}.uid`,r)]))}async getSingle(e,r){return await this.getFirst(u(r,E(e)))}async getByType(e,r){return await this.get(u(r,E(e)))}async getAllByType(e,r){return await this.dangerouslyGetAll(u(r,E(e)))}async getByTag(e,r){return await this.get(u(r,C(e)))}async getAllByTag(e,r){return await this.dangerouslyGetAll(u(r,C(e)))}async getByEveryTag(e,r){return await this.get(u(r,ye(e)))}async getAllByEveryTag(e,r){return await this.dangerouslyGetAll(u(r,ye(e)))}async getBySomeTags(e,r){return await this.get(u(r,C(e)))}async getAllBySomeTags(e,r){return await this.dangerouslyGetAll(u(r,C(e)))}async getRepository(e){let r=new URL(this.documentAPIEndpoint);return this.accessToken&&r.searchParams.set("access_token",this.accessToken),await this.fetch(r.toString(),e)}async getRefs(e){return(await this.getRepository(e)).refs}async getRefByID(e,r){let o=await this.getRefs(r);return te(o,e)}async getRefByLabel(e,r){let o=await this.getRefs(r);return re(o,e)}async getMasterRef(e){let r=await this.getRefs(e);return xe(r)}async getReleases(e){return(await this.getRefs(e)).filter(o=>!o.isMasterRef)}async getReleaseByID(e,r){let o=await this.getReleases(r);return te(o,e)}async getReleaseByLabel(e,r){let o=await this.getReleases(r);return re(o,e)}async getTags(e){try{let r=await this.getCachedRepositoryForm("tags",e),o=new URL(r.action);return this.accessToken&&o.searchParams.set("access_token",this.accessToken),await this.fetch(o.toString(),e)}catch{return(await this.getRepository(e)).tags}}async buildQueryURL({signal:e,fetchOptions:r,...o}={}){let i=o.ref||await this.getResolvedRefString({signal:e,fetchOptions:r}),n=o.integrationFieldsRef||(await this.getCachedRepository({signal:e,fetchOptions:r})).integrationFieldsRef||void 0;return Qe(this.documentAPIEndpoint,{...this.defaultParams,...o,ref:i,integrationFieldsRef:n,routes:o.routes||this.routes,brokenRoute:o.brokenRoute||this.brokenRoute,accessToken:o.accessToken||this.accessToken})}async resolvePreviewURL(e){var r,o;let i=e.documentID,n=e.previewToken;if(typeof globalThis.location<"u"){let a=new URLSearchParams(globalThis.location.search);i=i||a.get("documentId"),n=n||a.get("token")}else if(this.refState.httpRequest){if("query"in this.refState.httpRequest)i=i||((r=this.refState.httpRequest.query)==null?void 0:r.documentId),n=n||((o=this.refState.httpRequest.query)==null?void 0:o.token);else if("url"in this.refState.httpRequest&&this.refState.httpRequest.url){let a=new URL(this.refState.httpRequest.url,"missing-host://").searchParams;i=i||a.get("documentId"),n=n||a.get("token")}}if(i!=null&&n!=null){let a=await this.getByID(i,{ref:n,lang:"*",signal:e.signal,fetchOptions:e.fetchOptions}),s=P(a,{linkResolver:e.linkResolver});if(typeof s=="string")return s}return e.defaultURL}queryLatestContent(){this.refState.mode=V.Master}queryContentFromReleaseByID(e){this.refState={...this.refState,mode:V.ReleaseID,releaseID:e}}queryContentFromReleaseByLabel(e){this.refState={...this.refState,mode:V.ReleaseLabel,releaseLabel:e}}queryContentFromRef(e){this.refState={...this.refState,mode:V.Manual,ref:e}}async graphQLFetch(e,r){let o=await this.getCachedRepository(),i=await this.getResolvedRefString(),n={"Prismic-ref":i,Authorization:this.accessToken?`Token ${this.accessToken}`:"",...r?r.headers:{}};o.integrationFieldsRef&&(n["Prismic-integration-field-ref"]=o.integrationFieldsRef);let a={};for(let l in n)n[l]&&(a[l.toLowerCase()]=n[l]);let s=new URL(e);s.searchParams.set("ref",i);let c=s.searchParams.get("query");return c&&s.searchParams.set("query",Ze(c)),await this.fetchFn(s.toString(),{...r,headers:a})}async getCachedRepository(e){return(!this.cachedRepository||Date.now()>=this.cachedRepositoryExpiration)&&(this.cachedRepositoryExpiration=Date.now()+gr,this.cachedRepository=await this.getRepository(e)),this.cachedRepository}async getCachedRepositoryForm(e,r){let i=(await this.getCachedRepository(r)).forms[e];if(!i)throw new f(`Form with name "${e}" could not be found`,void 0,void 0);return i}async getResolvedRefString(e){var r,o;if(this.refState.autoPreviewsEnabled){let a,s;if((r=this.refState.httpRequest)!=null&&r.headers?"get"in this.refState.httpRequest.headers&&typeof this.refState.httpRequest.headers.get=="function"?s=this.refState.httpRequest.headers.get("cookie"):"cookie"in this.refState.httpRequest.headers&&(s=this.refState.httpRequest.headers.cookie):(o=globalThis.document)!=null&&o.cookie&&(s=globalThis.document.cookie),s&&(a=ze(s)),a)return a}let i=await this.getCachedRepository(e),n=this.refState.mode;if(n===V.ReleaseID)return te(i.refs,this.refState.releaseID).ref;if(n===V.ReleaseLabel)return re(i.refs,this.refState.releaseLabel).ref;if(n===V.Manual){let a=await De(this.refState.ref)();if(typeof a=="string")return a}return xe(i.refs).ref}async _get(e,r=0){var o,i;let n=await this.buildQueryURL(e);try{return{data:await this.fetch(n,e),url:n}}catch(a){if(!(a instanceof O||a instanceof z)||r>=br-1)throw a;e?.ref||(this.cachedRepository=void 0);let s=(i=(o=a.message.match(/Master ref is: (?<ref>.*)$/))==null?void 0:o.groups)==null?void 0:i.ref;if(!s)throw a;let c=new URL(n).searchParams.get("ref"),l=a instanceof O?"invalid":"expired";return console.warn(`The ref (${c}) was ${l}. Now retrying with the latest master ref (${s}). If you were previewing content, the response will not include draft content.`),await this._get({...e,ref:s},r+1)}}async fetch(e,r={}){let o=await super.fetch(e,r);if(o.status!==404&&o.status!==429&&o.json==null)throw new f(void 0,e,o.json||o.text);switch(o.status){case 200:case 201:return o.json;case 400:throw new ie(o.json.message,e,o.json);case 401:case 403:throw new S(o.json.error||o.json.message,e,o.json);case 404:throw o.json===void 0?new ae(`Prismic repository not found. Check that "${this.documentAPIEndpoint}" is pointing to the correct repository.`,e,e.startsWith(this.documentAPIEndpoint)?void 0:o.text):o.json.type==="api_notfound_error"?new O(o.json.message,e,o.json):o.json.type==="api_security_error"&&/preview token.*expired/i.test(o.json.message)?new ne(o.json.message,e,o.json):new $(o.json.message,e,o.json);case 410:throw new z(o.json.message,e,o.json);case 429:{let i=Number(o.headers.get("retry-after")),n=Number.isNaN(i)?_r:i;return await new Promise((a,s)=>{setTimeout(async()=>{try{a(await this.fetch(e,r))}catch(c){s(c)}},n)})}}throw new f(void 0,e,o.json)}};Z=new WeakMap;var Re=(t,e)=>new le(t,e);var b={};Fe(b,{color:()=>Mr,contentRelationship:()=>Ur,date:()=>Rr,embed:()=>Sr,geoPoint:()=>Vr,group:()=>Nr,image:()=>xr,imageThumbnail:()=>it,integrationField:()=>at,integrationFields:()=>jr,keyText:()=>nt,link:()=>Me,linkToMedia:()=>wr,number:()=>kr,repeatable:()=>Wr,richText:()=>ot,select:()=>Xr,sliceZone:()=>Ir,table:()=>Lr,timestamp:()=>Tr,title:()=>yr});var h=t=>t!=null,Te=t=>!!t.length,ot=t=>h(t)?t.length===1&&"text"in t[0]?!!t[0].text:!!t.length:!1,yr=ot,it=t=>h(t)&&!!t.url,xr=it,Me=t=>h(t)&&("id"in t||"url"in t),wr=Me,Ur=Me,Rr=h,Tr=h,Mr=h,kr=h,nt=t=>h(nt)&&!!t,Xr=h,Sr=t=>h(t)&&!!t.embed_url,Vr=t=>h(t)&&"longitude"in t,Lr=h,at=h,jr=at,Wr=t=>h(t)&&Te(t),Nr=t=>h(t)&&Te(t),Ir=t=>h(t)&&Te(t);var st=(t,e=" ")=>{let r="";for(let o=0;o<t.length;o++)"text"in t[o]&&(r+=(r?e:"")+t[o].text);return r};var ke=(t,...e)=>{if(t){let[r]=e,o;return typeof r=="string"?o={separator:r}:o={...r},st(t,o.separator)}else return null};var Er=/["'&<>]/,de=t=>{let e=""+t,r=Er.exec(e);if(!r)return e;let o,i="",n=0,a=0;for(n=r.index;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 38:o="&amp;";break;case 39:o="&#39;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}a!==n&&(i+=e.substring(a,n)),a=n+1,i+=o}return a!==n?i+e.substring(a,n):i};var G=(t,e)=>{let r={...e};"direction"in t&&t.direction==="rtl"&&(r.dir=t.direction),"data"in t&&"label"in t.data&&t.data.label&&(r.class=r.class?`${r.class} ${t.data.label}`:t.data.label);let o=[];for(let i in r){let n=r[i];n&&(typeof n=="boolean"?o.push(i):o.push(`${i}="${de(n)}"`))}return o.length&&o.unshift(""),o.join(" ")},B=t=>t&&typeof t!="function"?t:{},v=(t,e)=>{let r=B(e);return({node:o,children:i})=>`<${t}${G(o,r)}>${i}</${t}>`},ct=t=>{let e=B(t);return({node:r})=>`<pre${G(r,e)}>${de(r.text)}</pre>`},lt=(t,e)=>{let r=B(e);return({node:o})=>{let i={...r,src:o.url,alt:o.alt,copyright:o.copyright},n=`<img${G(o,i)} />`;return o.linkTo&&(n=Xe(t)({type:"hyperlink",node:{type:"hyperlink",data:o.linkTo,start:0,end:0},text:"",children:n,key:""})),`<p class="block-img">${n}</p>`}},dt=t=>{let e=B(t);return({node:r})=>{let o={...e,"data-oembed":r.oembed.embed_url,"data-oembed-type":r.oembed.type,"data-oembed-provider":r.oembed.provider_name};return`<div${G(r,o)}>${r.oembed.html}</div>`}},Xe=(t,e)=>{let r=B(e);return({node:o,children:i})=>{let n={...r};return o.data.link_type===k.Web?(n.href=o.data.url,n.target=o.data.target,n.rel="noopener noreferrer"):o.data.link_type===k.Document?n.href=P(o.data,{linkResolver:t}):o.data.link_type===k.Media&&(n.href=o.data.url),`<a${G(o,n)}>${i}</a>`}},mt=()=>({text:t})=>t?de(t).replace(/\n/g,"<br />"):"";var me=()=>(++me.i).toString();me.i=0;var pt=t=>{let e=$r(t),r=[];for(let o=0;o<e.length;o++)r.push(ft(e[o]));return{key:me(),children:r}},Q=(t,e=[])=>({key:me(),type:t.type,text:"text"in t?t.text:void 0,node:t,children:e}),Se=t=>Q({type:w.span,text:t,spans:[]}),$r=t=>{let e=t.slice(0);for(let r=0;r<e.length;r++){let o=e[r];if(o.type===w.listItem||o.type===w.oListItem){let i=[o];for(;e[r+1]&&e[r+1].type===o.type;)i.push(e[r+1]),e.splice(r,1);o.type===w.listItem?e[r]={type:w.list,items:i}:e[r]={type:w.oList,items:i}}}return e},ft=t=>{if("text"in t)return Q(t,ut(t.spans,t));if("items"in t){let e=[];for(let r=0;r<t.items.length;r++)e.push(ft(t.items[r]));return Q(t,e)}return Q(t)},ut=(t,e,r)=>{if(!t.length)return[Se(e.text)];let o=t.slice(0);o.sort((n,a)=>n.start-a.start||a.end-n.end);let i=[];for(let n=0;n<o.length;n++){let a=o[n],s=r&&r.start||0,c=a.start-s,l=a.end-s,m=e.text.slice(c,l),p=[];for(let X=n;X<o.length;X++){let T=o[X];T!==a&&(T.start>=a.start&&T.end<=a.end?(p.push(T),o.splice(X,1),X--):T.start<a.end&&T.end>a.start&&(p.push({...T,end:a.end}),o[X]={...T,start:a.end}))}n===0&&c>0&&i.push(Se(e.text.slice(0,c)));let I={...a,text:m};i.push(Q(I,ut(p,{...e,text:m},a))),l<e.text.length&&i.push(Se(e.text.slice(l,o[n+1]?o[n+1].start-s:void 0)))}return i};var ht=(t,e)=>gt(pt(t).children,e),gt=(t,e)=>{let r=[];for(let o=0;o<t.length;o++){let i=t[o],n=e(i.type,i.node,i.text,gt(i.children,e),i.key);n!=null&&r.push(n)}return r};var vt={[w.listItem]:"listItem",[w.oListItem]:"oListItem",[w.list]:"list",[w.oList]:"oList"};var _t=t=>(e,r,o,i,n)=>{let a=t[vt[e]||e];if(a)return a({type:e,node:r,text:o,children:i,key:n})};var bt=(...t)=>(...e)=>{for(let r=0;r<t.length;r++){let o=t[r];if(o){let i=o(...e);if(i!=null)return i}}};var Ve=(t,e)=>{let r=(i,n)=>typeof i=="function"?a=>i?.(a)||n(a):n,o={heading1:r(e?.heading1,v("h1",e?.heading1)),heading2:r(e?.heading2,v("h2",e?.heading2)),heading3:r(e?.heading3,v("h3",e?.heading3)),heading4:r(e?.heading4,v("h4",e?.heading4)),heading5:r(e?.heading5,v("h5",e?.heading5)),heading6:r(e?.heading6,v("h6",e?.heading6)),paragraph:r(e?.paragraph,v("p",e?.paragraph)),preformatted:r(e?.preformatted,ct(e?.preformatted)),strong:r(e?.strong,v("strong",e?.strong)),em:r(e?.em,v("em",e?.em)),listItem:r(e?.listItem,v("li",e?.listItem)),oListItem:r(e?.oListItem,v("li",e?.oListItem)),list:r(e?.list,v("ul",e?.list)),oList:r(e?.oList,v("ol",e?.oList)),image:r(e?.image,lt(t,e?.image)),embed:r(e?.embed,dt(e?.embed)),hyperlink:r(e?.hyperlink,Xe(t,e?.hyperlink)),label:r(e?.label,v("span",e?.label)),span:r(e?.span,mt())};return Pr(o)},Pr=t=>{let e={};for(let r in t){let o=t[r];o&&(e[r]=i=>o({...i,children:i.children.join("")}))}return _t(e)},Le=(t,...e)=>{if(t){let[r,o]=e,i;typeof r=="function"||r==null?i={linkResolver:r,serializer:o}:i={...r};let n;return i.serializer?typeof i.serializer=="function"?n=bt((a,s,c,l,m)=>i.serializer(a,s,c,l.join(""),m),Ve(i.linkResolver)):n=Ve(i.linkResolver,i.serializer):n=Ve(i.linkResolver),ht(t,n).join("")}else return null};var Ar=t=>t.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`),je=(t,e)=>{let r=new URL(t);for(let i in e){let n=Ar(i),a=e[i];a===void 0?r.searchParams.delete(n):Array.isArray(a)?r.searchParams.set(n,a.join(",")):r.searchParams.set(n,`${a}`)}let o=r.searchParams.get("s");return o&&(r.searchParams.delete("s"),r.searchParams.append("s",o)),r.toString()};function pe(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var o in r)t[o]=r[o]}return t}var Fr={read:function(t){return t[0]==='"'&&(t=t.slice(1,-1)),t.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(t){return encodeURIComponent(t).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};function We(t,e){function r(i,n,a){if(!(typeof document>"u")){a=pe({},e,a),typeof a.expires=="number"&&(a.expires=new Date(Date.now()+a.expires*864e5)),a.expires&&(a.expires=a.expires.toUTCString()),i=encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var s="";for(var c in a)a[c]&&(s+="; "+c,a[c]!==!0&&(s+="="+a[c].split(";")[0]));return document.cookie=i+"="+t.write(n,i)+s}}function o(i){if(!(typeof document>"u"||arguments.length&&!i)){for(var n=document.cookie?document.cookie.split("; "):[],a={},s=0;s<n.length;s++){var c=n[s].split("="),l=c.slice(1).join("=");try{var m=decodeURIComponent(c[0]);if(a[m]=t.read(l,m),i===m)break}catch{}}return i?a[i]:a}}return Object.create({set:r,get:o,remove:function(i,n){r(i,"",pe({},n,{expires:-1}))},withAttributes:function(i){return We(this.converter,pe({},this.attributes,i))},withConverter:function(i){return We(pe({},this.converter,i),this.attributes)}},{attributes:{value:Object.freeze(e)},converter:{value:Object.freeze(t)}})}var yt=We(Fr,{path:"/"});var D="greencube";var wt="Green Cube";var Ne="de";var Ut="/favicon-KIP7FLO3.png";var Rt="/opengraph-de-IEESOSTQ.png";var Tt="/opengraph-en-BGWA4C2O.png";var Mt="/ITCGaramondStd-LtCond-32R5CTWO.woff2";var kt="/HelveticaNeueLTStd-Lt-VCAZILVV.woff2";var fe={HTML:"_f6ab87",Body:"_d20365",Content:"_f89dfe"};var zr="https://greencube.space";function Xt({children:t,header:e,intro:r,stage:o,lang:i=Ne,routes:n=[]}){return`<!doctype html>
		<html lang="${i}" class="${fe.HTML}">
			<head>
				<meta charset="utf-8" />
				<title>${wt}</title>
				<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
				<meta
					property="og:image"
					content="${zr}${(i===Ne?Rt:Tt).replace("./","/")}"
				/>
				<link rel="shortcut icon" type="image/png" href="${Ut.replace("./","/")}" />
				<link rel="preload" href="${Mt.replace("./","/")}" as="font" crossorigin="anonymous" />
				<link rel="preload" href="${kt.replace("./","/")}" as="font" crossorigin="anonymous" />

				<link rel="stylesheet" type="text/css" href="/index.css" />
				${n.filter(a=>a.startsWith(`/${i}`)).map(a=>`<link rel="prefetch" href="${a}index.html"/>`).join("")}
				${`<script
							async
							defer
							src="https://static.cdn.prismic.io/prismic.js?new=true&repo=${D}"
						><\/script>`}

				<script>
					window.__ROUTES__ = ${JSON.stringify(n)}
				<\/script>

				<script async defer type="module" src="/index.js"><\/script>

				<!-- Google tag (gtag.js) -->
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-FWFQL9LVNT"><\/script>
				<script>
					window.dataLayer = window.dataLayer || []
					function gtag() {
						dataLayer.push(arguments)
					}
					gtag('js', new Date())
					gtag('config', 'G-FWFQL9LVNT')
				<\/script>

				
			</head>
			<body class="${fe.Body}">
				${o} ${e}
				<div class="${fe.Content}">${t}</div>
				${r}
			</body>
		</html>`}var y={Main:"_190b32",Open:"_6b1088",Visible:"_3111dd",Lemon:"_889852",Forest:"_b977da",HasContent:"_1be840",Border:"_18d1bd",Wrapper:"_9622f0",End:"_1ee20c",Content:"_c1b0c0",Footer:"_0b3d52",Aside:"_2d7757",Column:"_f72612",Lang:"_aa74c6",Narrow:"_79c599",News:"_eb71cf"};function St(t){var e,r,o="";if(typeof t=="string"||typeof t=="number")o+=t;else if(typeof t=="object")if(Array.isArray(t)){var i=t.length;for(e=0;e<i;e++)t[e]&&(r=St(t[e]))&&(o&&(o+=" "),o+=r)}else for(r in t)t[r]&&(o&&(o+=" "),o+=r);return o}function Zr(){for(var t,e,r=0,o="",i=arguments.length;r<i;r++)(t=arguments[r])&&(e=St(t))&&(o&&(o+=" "),o+=e);return o}var g=Zr;var Ie={Main:"_d4edf9",Loaded:"_58b5ce",Fill:"_b2044f",Img:"_e380e4",Cover:"_1d4a3e"};var Gr=[640,960,1280,1440,1920,2560];function Vt(t){let{sizes:e,primary:{image:r}}=t;if(!b.image(r))return;let o=Gr.map(n=>`${je(r.url,{w:n})} ${n}w`).join(", "),i=r.dimensions.width/r.dimensions.height;return`<div class="${g(Ie.Main)}" style="--aspect:${i};">
		<img
			class="${Ie.Img}"
			srcset="${o}"
			sizes="${e||"100vw"}"
			alt="${r.alt?.replaceAll('"',"'")}"
			loading="lazy"
		/>
	</div>`}var Y={Main:"_ab40f5",Item:"_187561",Right:"_0dfbe7",Visible:"_b4c3f7",Title:"_d010ea"};function Lt(t){let{primary:{facts:e}}=t;return`
		<div class="${Y.Main}">
			${e?.map(({title:r,text:o,column:i})=>`
						<div class="${g(Y.Item,i==="Right"&&Y.Right)}">
							<h3 class="${Y.Title}">${r}</h3>
							<div>${o}</div>
						</div>
					`).join("")}
		</div>
	`}var J={Main:"_4810c0",Entry:"_83367b",Date:"_241a3d",Title:"_e8f1cd"};var Ee={Main:"_9d6b51",Alternate:"_b6af36"};var x=t=>{let{type:e,uid:r,lang:o}=t;return e==="page"&&r==="index"?`/${o}/`:e==="page"?`/${o}/${r}/`:"/"};function A({text:t,serializer:e}){return b.richText(t)?Le(t,{linkResolver:x,serializer:e}):""}var Br={label:({node:t,children:e})=>{if(t.data.label==="alternate")return`<span class="${Ee.Alternate}">${e}</span>`}};function ue({text:t}){return`<div class="${Ee.Main}">${A({text:t,serializer:Br})}</div>`}function jt(t){let{lang:e,primary:{entries:r}}=t;return`
		<div class="${J.Main}">
			${r?.map(({date:o,title:i,text:n},a)=>`
						<article class="${J.Entry}">
							${b.date(o)?`<div class="${J.Date}">
										${new Date(o).toLocaleDateString(e,{dateStyle:"long",timeZone:"Europe/Zurich"})}
									</div>`:""}
							<h3 class="${J.Title}">${i}</h3>
							${ue({text:n})}
						</article>
					`).join("")}
		</div>
	`}var H={Main:"_fce1e2",Wrapper:"_bedaeb",Inner:"_d43144",Item:"_2adfe9",Active:"_3539ec"};function Wt(t){let{primary:{entries:e}}=t;return`
		<div class="${H.Main}">
			<div class="${H.Wrapper}">
				<div class="${H.Inner}">
					${e?.map(({date:r,text:o,active:i})=>`
								<div class="${g(H.Item,i&&H.Active)}">
									<h3>${r}</h3>
									<div>${o}</div>
								</div>
							`).join("")}
				</div>
			</div>
		</div>
	`}var Nt={Main:"_fa5c11"};function It(t){let{primary:{text:e}}=t;return` <div class="${Nt.Main}">${ue({text:e})}</div> `}var Et={Main:"_5b8182"};function $t(t){let{footer:{data:{items:e}}}=t;return`
		<footer class="${Et.Main}">
			${e?.map(({text:r})=>` <div>${A({text:r})}</div> `).join("")}
		</footer>
	`}var he={Main:"_e81189",Link:"_ab4318",Icon:"_806e1d",Column2:"_37598e"};function Pt(t){let{primary:{link:e}}=t;return`
		<div class="${g(he.Main)}">
			${e.map(r=>`<a href="${P(r)}" class="${he.Link}">
							<span>${r?.text}</span>
							<svg class="${he.Icon}" viewBox="0 0 101 101" xmlns="http://www.w3.org/2000/svg">
								<path
									vector-effect="non-scaling-stroke"
									d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z"
								/>
								<path d="M50.5 16.55V84.45" vector-effect="non-scaling-stroke" />
								<path d="M84.4502 50.5L16.5502 50.5" vector-effect="non-scaling-stroke" /></svg
						></a>`).join("")}
		</div>
	`}var K={Main:"_530659",Visible:"_e11df6",Long:"_03bb8f",Short:"_5aa79a"};var Yr={de:"Deutsch",en:"English"},Jr={de:"Deutsche Version",en:"English Version"};function ge(t){let{alternates:e=[],color:r}=t;return`
		<div class="${g(K.Main,r===13629521&&K.Lemon)}">
			${e.map(o=>`<a href="${x(o)}" data-pass="true">
					<span class="${K.Short}">${Yr[o.lang]}</span
					><span class="${K.Long}">${Jr[o.lang]}</span>
				</a>`)}
		</div>
	`}function At(t){let{page:{id:e,lang:r,alternate_languages:o,data:{slices:i,color:n,point_of_interest:a,news:s}},header:c,footer:l}=t,m=i?.map(M=>{switch(M.slice_type){case"facts":return Lt({...M});case"timeline":return Wt({...M})}}).join(""),p=i?.map(M=>{switch(M.slice_type){case"image":return Vt({...M,sizes:a?"(orientation: landscape) 50vw, 100vw":void 0});case"news":return jt({lang:r,...M});case"copy":return It({...M});case"links":return Pt({...M})}}).join(""),I=!!m||!!p,X=c?.data.pages||[],T=X.findIndex(({page:M})=>M?.id===e),Pe=T>-1,Ae=Pe?T+1:1,Kt=Pe?X.length-Ae:0;return`
		<main>
			<div
				class="${g(y.Main,s&&y.News,a&&y.Narrow,n==="lemon"&&y.Lemon,n==="forest"&&y.Forest,I&&y.HasContent)}"
				style="--start: ${Ae}; --end:${Kt};"
			>
				<div class="${y.Border}">
					<div class="${y.Wrapper}">
						<div class="${y.Content}">
							${m?`<div class="${y.Aside}">${m}</div>`:""}
							${p?`<div class="${y.Column}">${p}</div>`:""}
						</div>
						${!a&&l?`<div class="${y.Footer}" style="${I?"0":`--padding:${X.length}`};">${$t({footer:l})}</div>`:""}
					</div>
				</div>
			</div>
			<div>${ge({alternates:o})}</div>
		</main>
	`}var Kr="MC5aN3hGWVJFQUFDMEFmWV9G.77-9Zu-_vQhABO-_ve-_vQ3vv71b77-9XO-_vTMq77-9KO-_vX7vv71IN1tX77-9SO-_vSPvv70OSA",eo=[{type:"page",path:"/:lang",uid:"index"},{type:"page",path:"/:lang/:uid"}],F=(t={})=>Re(D,{routes:eo,accessToken:Kr,...t});function Ft(t,e,r){return F({ref:r}).getByUID("page",t,{lang:e})}function qt(t,e){return F({ref:e}).getSingle("intro",{lang:t})}function Ot(t,e){return F({ref:e}).getSingle("stage",{lang:t})}function Dt(t,e){return F({ref:e}).getSingle("footer",{lang:t})}function Ht(t,e){return F({ref:e}).getSingle("header",{lang:t,fetchLinks:["page.title","page.color"]})}async function Ct(t,e){return F({ref:e}).getByID(t,{ref:e})}function zt(t,e){return F({ref:e}).getAllByType("page",{lang:t})}var ve={Main:"_68f6d6",Logo:"_df3134",Visible:"_e09e15",Menu:"_68695a"};var L={Main:"_2680ad",Active:"_5257f8",Header:"_0ca877",Sand:"_f722b9",Lemon:"_6ebb2e",Forest:"_53e7d7",Border:"_9bef0c",Animating:"_c41eee",Narrow:"_c047d6"};var R={Main:"_2bb0cd",Flat:"_7423af",Border:"_19693e",Lemon:"_9655f4",Forest:"_864f6c",Forest2:"_fc31b1",Wrapper:"_14690a",Icon:"_6c8233",Inner:"_5862ff",Label:"_fc3732",Line:"_19c712",Active:"_5a376b"};function _e(t){let{href:e,text:r,flat:o,color:i="sand",border:n=!1}=t,a=g(R.Main,o&&R.Flat,n&&R.Border,i==="lemon"&&R.Lemon,i==="forest"&&R.Forest,i==="forest-2"&&R.Forest2),s=`
		<span class="${R.Wrapper}">
			<svg class="${R.Icon}" viewBox="0 0 101 101" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z"
					vector-effect="non-scaling-stroke"
				/>
				<path class="${R.Line}" d="M50.5 16.55V84.45" vector-effect="non-scaling-stroke" />
				<path d="M84.4502 50.5L16.5502 50.5" vector-effect="non-scaling-stroke" />
			</svg>
		</span>
		<span class="${R.Inner}">
			<span class="${R.Label}">${r}</span>
		</span>
	`;return e?` <a href="${e}" class="${a}">${s}</a> `:` <span class="${a}"> ${s} </span>`}function Zt(t){let{page:e,offset:r,index:o,inHeader:i,active:n}=t,{data:{title:a,color:s,point_of_interest:c}}=e;return`
		<div
			class="${g(L.Main,i&&L.Header,n&&L.Active,c&&L.Narrow,s==="sand"&&L.Sand,s==="lemon"&&L.Lemon,s==="forest"&&L.Forest)}"
			style="--offset:${r}; --index:${o}"
			data-in-header="${i}"
			data-pathname="${x(e)}"
		>
			${_e({href:x(e),text:a,color:s,flat:!0})}
			<div class="${L.Border}"></div>
		</div>
	`}function $e(t,e){return e.findIndex(({page:r})=>b.contentRelationship(r)&&r.id===t.id)}function Gt(t){let{header:{lang:e,data:{pages:r}},pages:o,route:i}=t,n=o.filter(c=>$e(c,r)>-1),a=o.sort((c,l)=>$e(c,r)<$e(l,r)?-1:1).filter(c=>c.uid!=="index"),s=a.findIndex(c=>x(c)===i);return`
		<nav class="${ve.Main}">
			<a href="/${e}" class="${ve.Logo}"><span>GreenTech</span></a>
			<div class="${ve.Menu}">
				${a?.map((c,l)=>{let m=!!n.find(({id:p})=>c.id===p);return Zt({page:c,active:m?l<=s:l===s,offset:(l-a.length)*-1,index:n.length-(l-a.length)*-1,inHeader:!!n.find(({id:p})=>c.id===p)})}).join("")}
			</div>
		</nav>
	`}var j={Main:"_8ff6a2",Container:"_64c0f3",History:"_cb831c",Inner:"_388974",Item:"_0db6a0",Year:"_1225d2",Text:"_4811f3",Loader:"_9ba37c",Hidden:"_983f72"};function Bt(t){let{data:{points_of_interest:e,history_items:r}}=t,o=e.map(({title:i,point_of_interest:n,position:a})=>({title:i,position:b.keyText(a)?a:"0,0,0",href:b.contentRelationship(n)?x(n):""}));return`
		<div class="${j.Main}">
			<div class="${j.Container}" data-poi="${encodeURI(JSON.stringify(o))}"></div>
			<div class="${j.History}">
				<div class="${j.Inner}">
					${r.map(({year:i,text:n})=>`<article class="${j.Item}">
									<div class="${j.Year}">${i}</div>
									<div class="${j.Text}">${ke(n)}</div>
								</article>`).join("")}
				</div>
			</div>
			<div class="${j.Loader}">0%</div>
		</div>
	`}var N={Main:"_b400e8",Hidden:"_289adb",Title:"_8ef264",Visible:"_ea58ee",Claim:"_c3bb59",Inner:"_72681f",Button:"_34fe16",Alternate:"_9a48ec",Lang:"_5ddc80",Over:"_ceae8d",Translate:"_0445ca"};var Qt={label:({node:t,children:e})=>{if(t.data.label==="alternate")return`<span class="${N.Alternate}">${e}</span>`}};function Yt(t){let{intro:{data:{claim:e,button:r}},page:{alternate_languages:o}}=t;return`
		<div class="${N.Main}">
			<h1 class="${N.Title}">GreenCube</h1>
			<div class="${N.Claim}">
				<div class="${N.Inner}">${A({text:e,serializer:Qt})}</div>
			</div>

			<button class="${N.Button}">
				${_e({href:"",color:"forest-2",text:A({text:r,serializer:Qt}),border:!0})}
			</button>
			<div class="${N.Lang}">${ge({alternates:o})}</div>
		</div>
	`}var Jt=class{ref;previewMode;constructor(){this.ref=yt.get(oe.preview),this.previewMode=this.ref?!!JSON.parse(this.ref)[`${D}.prismic.io`]:!1}async fetch(e){let r="",o,i="de";if(e.includes("/unpublished/")){let a=new URLSearchParams(e.replace("/unpublished/","")).get("documentId");if(a){let s=await Ct(a);s.uid?o=s.uid:window.location.href=window.location.origin}}else o=e.split("/")[1]||"index";if(o){let[n,a,s,c,l,m]=await Promise.all([Ft(o,i,this.ref),qt(i,this.ref),Ot(i,this.ref),Ht(i,this.ref),Dt(i,this.ref),zt(i,this.ref)]);r=Xt({children:At({page:n,header:c,footer:l}),header:c?Gt({header:c,pages:m,route:e}):"",intro:a?Yt({intro:a,page:n}):"",stage:s?Bt(s):"",routes:m.map(p=>x(p)),lang:n.lang})}return r}};export{Jt as PreviewManager};
/*! Bundled license information:

js-cookie/dist/js.cookie.mjs:
  (*! js-cookie v3.0.5 | MIT *)
*/

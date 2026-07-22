import{Bt as e,Ht as t,Q as n,U as r,W as i,er as a,qn as o,qt as s,yn as c}from"./framework.DlhRx4bQ.js";import{t as l}from"./theme.Wmkaijgp.js";import"./chunks/vue-i18n.2w6-LfJI.js";import{a as u,i as d}from"./chunks/vue-router.CmiELS9I.js";var f={__name:`2018-12-02-others`,setup(f,{expose:p}){let m=o(JSON.parse(`{"title":"杂物","description":"","frontmatter":{"cid":28,"title":"杂物","slug":28,"date":"2018/12/02 16:16:34","updated":"2018/12/02 16:16:34","status":"hidden","author":"harumonia","categories":["源流清泉","Algorithm \\\\ Data Structure"],"tags":["算法"],"thumbStyle":"default","hidden":false},"headers":[],"relativePath":"pages/posts/2018-12-02-others.md"}`)),h=u(),g=d(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,t(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{cid:28,title:`杂物`,slug:28,date:`2018/12/02 16:16:34`,updated:`2018/12/02 16:16:34`,status:`hidden`,author:`harumonia`,categories:[`源流清泉`,`Algorithm \\ Data Structure`],tags:[`算法`],thumbStyle:`default`,hidden:!1}}),(t,o)=>{let u=l;return e(),i(u,{frontmatter:a(_)},{"main-content-md":c(()=>[...o[0]||=[r(`div`,{class:`language-c++`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`},`c++`),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`/*报时`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},` #include <iostream>`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`#include <map>`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`#include <string>`)]),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`using namespace std;`)]),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`map<int, string> mapA={{0,"zero"},{ 1, "one"},{ 2,"two"},{3,"three"}, {4,"four"}, {5,"five"}, {6,"six"}, {7,"seven"}, {8,"eight"}, {9,"nine"}, {10,"ten"}, {11,"eleven"}, {12,"twelve"}, {13,"thirteen"}, {14,"fourteen"}, {15,"fifteen"}, {16,"sixteen"}, {17,"seventeen:"}, {18,"eighteen"}, {19,"nineteen"}, {20,"twenty"},{30,"thirty"},{40,"forty"},{50,"fifty"}};`)]),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`void trans(int num)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`{`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    int shiwei,gewei;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    if (num<=20||num%10==0) {`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`        cout << mapA[num];`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    }`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    else if (num>20||num%10!=0)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    {`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`        shiwei=num/10;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`        shiwei*=10;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`        gewei=num%10;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`        cout << mapA[shiwei]<<" "<<mapA[gewei];`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    }`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`}`)]),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`int main()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`{`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    int hour,min;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    cin >> hour >> min;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    trans(hour);`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    cout << " ";`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    trans(min);`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    cout <<endl;`)]),n(`
`),r(`span`,{class:`line`}),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`    return 0;`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`}`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`}},`*/`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1)]]),"main-header":c(()=>[s(t.$slots,`main-header`)]),"main-header-after":c(()=>[s(t.$slots,`main-header-after`)]),"main-nav":c(()=>[s(t.$slots,`main-nav`)]),"main-content-before":c(()=>[s(t.$slots,`main-content-before`)]),"main-content":c(()=>[s(t.$slots,`main-content`)]),"main-content-after":c(()=>[s(t.$slots,`main-content-after`)]),"main-nav-before":c(()=>[s(t.$slots,`main-nav-before`)]),"main-nav-after":c(()=>[s(t.$slots,`main-nav-after`)]),comment:c(()=>[s(t.$slots,`comment`)]),footer:c(()=>[s(t.$slots,`footer`)]),aside:c(()=>[s(t.$slots,`aside`)]),"aside-custom":c(()=>[s(t.$slots,`aside-custom`)]),default:c(()=>[s(t.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};
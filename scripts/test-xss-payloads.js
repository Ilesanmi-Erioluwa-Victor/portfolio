async function main() {
  const { sanitizePostHtml } = await import("../lib/sanitize.js");

  let failures = 0;

  function check(name, input, mustNotContain, mustContain = []) {
    const out = sanitizePostHtml(input);
    const bad = mustNotContain.filter((s) => out.toLowerCase().includes(s.toLowerCase()));
    const missing = mustContain.filter((s) => !out.includes(s));
    if (bad.length || missing.length) {
      failures += 1;
      console.log(`FAIL ${name}`);
      if (bad.length) console.log(`  leaked: ${bad.join(", ")}`);
      if (missing.length) console.log(`  missing: ${missing.join(", ")}`);
      console.log(`  output: ${out.slice(0, 200)}`);
    } else {
      console.log(`ok ${name}`);
    }
  }

  check("img-onerror", '<img src="x" onerror="alert(1)">', ["onerror"]);
  check("js-link", '<a href="javascript:alert(1)">Click</a>', ["javascript:"], ["Click"]);
  check("script", "<script>alert(1)</script><p>hi</p>", ["<script", "alert(1)"], ["<p>hi</p>"]);
  check("svg-onload", '<svg onload="alert(1)"><circle r="10">', ["<svg", "onload"]);
  check("div-onclick", '<div onclick="alert(1)">test</div>', ["onclick"], ["test"]);
  check("iframe-js", '<iframe src="javascript:alert(1)"></iframe>', ["<iframe", "javascript:"]);
  check("vbscript-link", '<a href="vbscript:msgbox(1)">x</a>', ["vbscript:"]);
  check("data-html-link", '<a href="data:text/html,<script>alert(1)</script>">x</a>', ["data:text/html"]);
  check("style-attr", '<p style="color:red;position:absolute;left:0" onclick="x()">t</p>', ["onclick", "position"], ["<p", ">t</p>"]);
  check("form-object", '<form action="/x"><input name="q"><object data="x"></object></form>', ["<form", "<object", "<input"]);
  check("style-tag", "<style>body{display:none}</style><p>ok</p>", ["<style"], ["<p>ok</p>"]);

  check("headings", "<h1>T</h1><h2>T</h2><h3>T</h3><h4>T</h4>", [], ["<h1>T</h1>", "<h4>T</h4>"]);
  check("text-marks", "<p><strong>B</strong> <em>I</em> <u>U</u> <s>S</s> <code>c</code></p>", [], ["<strong>B</strong>", "<em>I</em>", "<u>U</u>", "<s>S</s>", "<code>c</code>"]);
  check("lists-quote", "<ul><li>a</li></ul><ol><li>b</li></ol><blockquote>q</blockquote>", [], ["<ul>", "<ol>", "<blockquote>"]);
  check("safe-link", '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="tiptap-link">e</a>', [], ['href="https://example.com"']);
  check("mailto-link", '<a href="mailto:a@b.com">m</a>', [], ["mailto:a@b.com"]);
  check("image", '<img src="https://cdn.example.com/blog/a.webp" alt="a" width="640" class="tiptap-image" data-align="center">', [], ['src="https://cdn.example.com/blog/a.webp"', 'data-align="center"']);
  check("codeblock", '<pre><code class="language-js"><span class="hljs-keyword">const</span> x</code></pre>', [], ['class="language-js"', "hljs-keyword"]);
  check("table", "<table><tr><th>h</th></tr><tr><td>c</td></tr></table>", [], ["<table>", "<th>h</th>", "<td>c</td>"]);
  check("align-style", '<p style="text-align: center">c</p>', [], ["text-align"]);
  check("hr", "<p>a</p><hr><p>b</p>", [], ["<hr"]);

  if (failures) {
    console.log(`\n${failures} FAILURE(S)`);
    process.exit(1);
  }
  console.log("\nall xss payload + regression checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

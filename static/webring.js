/*!
 * web2026 webring — a tiny, self-contained embeddable widget.
 *
 * Usage on a student's own site:
 *   <div id="web2026-ring"></div>
 *   <script src="https://teaching.aman.bh/web2026/showcase/webring.js" defer></script>
 *
 * Add data-variant="mini" to the div for the icon-only, extra-compact version.
 *
 * It fetches the current ring (webring.json, served next to this file) and renders a
 * prev / next / random / home control inside a Shadow DOM, so the host page's CSS can't
 * touch it (and vice-versa). The current site is matched by its domain — every member is
 * on its own custom domain, so there's nothing to configure.
 */
(function () {
	'use strict';

	// currentScript is set for parser-inserted tags (incl. defer). For scripts added
	// dynamically by a loader it is null, so fall back to matching our own src.
	var script = document.currentScript;
	if (!script) {
		var tags = document.querySelectorAll('script[src*="webring.js"]');
		script = tags[tags.length - 1] || null;
	}
	if (!script || !script.src) return;
	if (window.__web2026Webring) return; // guard against double-inclusion
	window.__web2026Webring = true;

	var DATA_URL = new URL('webring.json', script.src).href;
	var HOME_URL = new URL('webring', script.src).href;

	var PINK = '#ff48b0';
	var INK = '#321871';
	var PAPER = '#faf7ef';

	var ICON = {
		prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
		next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
		random: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 9-9 9-9-9z"/></svg>',
		home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 9.5V19h12V9.5"/></svg>',
		// the web2026 mark: a ransom "w" cut from two misregistered riso tiles (matches favicon.svg)
		mark:
			'<svg viewBox="0 0 512 512" aria-hidden="true">' +
			'<rect x="86" y="94" width="340" height="340" rx="26" fill="' + PINK + '" transform="rotate(-6 256 256)"/>' +
			'<rect x="78" y="82" width="340" height="340" rx="26" fill="' + INK + '" transform="rotate(3 256 256)"/>' +
			'<path d="M150 176 L200 342 L256 236 L312 342 L362 176" fill="none" stroke="' + PAPER + '" stroke-width="46" stroke-linejoin="round" stroke-linecap="round" transform="rotate(3 256 256)"/>' +
			'</svg>'
	};

	var STYLE =
		':host{all:initial}' +
		'.ring{box-sizing:border-box;display:inline-flex;align-items:center;gap:.5rem;' +
		'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;' +
		'line-height:1;color:' + INK + ';background:' + PAPER + ';border:1px solid rgba(50,24,113,.28);' +
		'border-radius:7px;padding:6px 10px;box-shadow:0 1px 2px rgba(50,24,113,.12);' +
		'letter-spacing:.02em;-webkit-font-smoothing:antialiased;max-width:100%;}' +
		'.ring.mini{gap:.3rem;padding:3px 6px;border-radius:6px;}' +
		'.ring a{display:inline-flex;align-items:center;gap:.25rem;color:inherit;text-decoration:none;' +
		'cursor:pointer;padding:2px 3px;border-radius:4px;transition:color .15s ease,transform .15s ease;}' +
		'.ring a:hover{color:' + PINK + ';}' +
		'.ring a.mark:hover{transform:rotate(-4deg) scale(1.08);}' +
		'.ring a:focus-visible{outline:2px solid ' + PINK + ';outline-offset:1px;}' +
		'.label{display:inline-flex;align-items:center;gap:.4rem;font-weight:700;white-space:nowrap;}' +
		'.mark{display:inline-flex;}' +
		'.sep{width:1px;height:14px;background:rgba(50,24,113,.2);flex:none;}' +
		'svg{width:13px;height:13px;display:block;}.icon svg{width:14px;height:14px;}' +
		'.mini svg{width:15px;height:15px;}' +
		'.mark svg{width:17px;height:17px;}.mini .mark svg{width:18px;height:18px;}' +
		'.txt{white-space:nowrap;}' +
		'@media (max-width:400px){.txt{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);}}';

	function hostOf(url) {
		try {
			return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
		} catch (e) {
			return '';
		}
	}

	// Match the current site by domain. `override` (data-site) is an optional escape
	// hatch that accepts a full URL or a bare hostname — not needed for custom domains.
	function findIndex(members, override) {
		var here;
		if (override && /^https?:\/\//i.test(override)) here = hostOf(override);
		else here = (override || location.hostname).replace(/^www\./, '').toLowerCase();
		if (!here) return -1;
		for (var i = 0; i < members.length; i++) {
			if (hostOf(members[i].url) === here) return i;
		}
		return -1;
	}

	function anchor(cls, href, title, html) {
		var a = document.createElement('a');
		a.className = cls;
		a.href = href;
		a.title = title;
		a.setAttribute('aria-label', title);
		a.innerHTML = html; // static icon markup only
		return a;
	}

	function sep() {
		var s = document.createElement('span');
		s.className = 'sep';
		s.setAttribute('aria-hidden', 'true');
		return s;
	}

	function buildBar(prev, next, rand) {
		var nav = document.createElement('nav');
		nav.className = 'ring';
		nav.setAttribute('aria-label', 'web2026 webring');

		nav.appendChild(
			anchor('prev', prev.url, 'Previous site: ' + prev.name, ICON.prev + '<span class="txt">prev</span>')
		);
		nav.appendChild(sep());

		var label = document.createElement('span');
		label.className = 'label';
		var mark = document.createElement('span');
		mark.className = 'mark';
		mark.setAttribute('aria-hidden', 'true');
		mark.innerHTML = ICON.mark;
		label.appendChild(mark);
		label.appendChild(document.createTextNode('web2026 ring'));
		nav.appendChild(label);

		nav.appendChild(sep());
		nav.appendChild(
			anchor('next', next.url, 'Next site: ' + next.name, '<span class="txt">next</span>' + ICON.next)
		);
		nav.appendChild(sep());
		nav.appendChild(anchor('icon random', rand.url, 'Random site', ICON.random));
		nav.appendChild(anchor('icon home', HOME_URL, 'All sites in the ring', ICON.home));
		return nav;
	}

	function buildMini(prev, next, rand) {
		var nav = document.createElement('nav');
		nav.className = 'ring mini';
		nav.setAttribute('aria-label', 'web2026 webring');
		nav.appendChild(anchor('prev', prev.url, 'Previous site: ' + prev.name, ICON.prev));
		nav.appendChild(anchor('mark', HOME_URL, 'web2026 ring — all sites', ICON.mark));
		nav.appendChild(anchor('next', next.url, 'Next site: ' + next.name, ICON.next));
		nav.appendChild(anchor('random', rand.url, 'Random site', ICON.random));
		return nav;
	}

	function render(members) {
		if (!Array.isArray(members) || members.length === 0) return;

		var mount = document.getElementById('web2026-ring') || document.querySelector('[data-web2026-ring]');
		var override = mount ? mount.getAttribute('data-site') : null;
		var variant = mount && mount.getAttribute('data-variant') === 'mini' ? 'mini' : 'bar';
		var idx = findIndex(members, override);
		var n = members.length;

		var prev = idx >= 0 ? members[(idx - 1 + n) % n] : members[n - 1];
		var next = idx >= 0 ? members[(idx + 1) % n] : members[0];
		var rand = members[Math.floor(Math.random() * n)];
		if (n > 1 && idx >= 0) {
			while (rand === members[idx]) rand = members[Math.floor(Math.random() * n)];
		}

		// Host element: reuse the provided mount, else drop one right after the script.
		var host = mount;
		if (!host) {
			host = document.createElement('span');
			if (script.parentNode) script.parentNode.insertBefore(host, script.nextSibling);
			else document.body.appendChild(host);
		}
		var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
		root.innerHTML = '<style>' + STYLE + '</style>';
		root.appendChild(variant === 'mini' ? buildMini(prev, next, rand) : buildBar(prev, next, rand));
	}

	function whenReady(cb) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', cb, { once: true });
		} else {
			cb();
		}
	}

	var data = fetch(DATA_URL)
		.then(function (r) {
			return r.ok ? r.json() : [];
		})
		.catch(function () {
			return [];
		});

	whenReady(function () {
		data.then(render).catch(function () {});
	});
})();

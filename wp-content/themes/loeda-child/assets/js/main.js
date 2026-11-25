/* Bodegas Loeda: edad, cookies, cabecera, aparición al hacer scroll e índice del artículo. Sin dependencias. */
(function () {
	'use strict';

	var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var esRobot = /bot|crawl|spider|slurp|lighthouse|pagespeed|headless/i.test(navigator.userAgent || '');

	function leer(n) { try { return window.localStorage.getItem(n); } catch (e) { return null; } }
	function guardar(n, v) { try { window.localStorage.setItem(n, v); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ } }

	/* Verificación de edad. [PENDIENTE: la gestoría valida si se recuerda la decisión y cuántos días]. */
	var DIAS_EDAD = 30;
	var edad = document.getElementById('edad');
	function edadVigente() {
		var v = leer('loeda_edad');
		var t = v ? parseInt(v, 10) : 0;
		return !!t && Date.now() - t < DIAS_EDAD * 86400000;
	}
	if (edad && !esRobot && !edadVigente()) {
		edad.hidden = false;
		document.documentElement.classList.add('edad-abierta');
		var primero = edad.querySelector('[data-edad="si"]');
		if (primero) { primero.focus(); }
		edad.addEventListener('click', function (e) {
			var b = e.target.closest('[data-edad]');
			if (!b) { return; }
			if (b.getAttribute('data-edad') === 'si') {
				guardar('loeda_edad', String(Date.now()));
				edad.hidden = true;
				document.documentElement.classList.remove('edad-abierta');
			} else {
				var m = document.getElementById('edad-menor');
				if (m) { m.hidden = false; }
			}
		});
		edad.addEventListener('keydown', function (e) {
			if (e.key !== 'Tab') { return; }
			var f = edad.querySelectorAll('button:not([hidden])');
			if (!f.length) { return; }
			var a = f[0], z = f[f.length - 1];
			if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
			else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
		});
	}

	/* Cookies: Google Analytics solo después de aceptar. */
	var cfg = window.loedaConfig || {};
	function cargarAnalytics() {
		if (!cfg.gaId || window.loedaGaCargado) { return; }
		window.loedaGaCargado = true;
		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.gaId);
		document.head.appendChild(s);
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () { window.dataLayer.push(arguments); };
		window.gtag('js', new Date());
		window.gtag('config', cfg.gaId, { anonymize_ip: true });
	}
	var cookies = document.getElementById('cookies');
	var consent = leer('loeda_cookies');
	if (consent === 'todas') {
		cargarAnalytics();
	} else if (!consent && cookies && !esRobot) {
		cookies.hidden = false;
		cookies.addEventListener('click', function (e) {
			var b = e.target.closest('[data-cookies]');
			if (!b) { return; }
			var v = b.getAttribute('data-cookies');
			guardar('loeda_cookies', v);
			cookies.hidden = true;
			if (v === 'todas') { cargarAnalytics(); }
		});
	}

	/* Cabecera: el sello baja de tamaño y en portada la barra se vuelve sólida. */
	var cab = document.querySelector('.loeda-header');
	if (cab) {
		var ticking = false;
		var ultimo = window.scrollY;
		var alternar = function () {
			var y = window.scrollY;
			cab.classList.toggle('es-compacta', y > 40);
			if (y > 240 && y > ultimo + 4) { cab.classList.add('oculta'); } else if (y < ultimo - 4 || y <= 240) { cab.classList.remove('oculta'); }
			ultimo = y;
			ticking = false;
		};
		window.addEventListener('scroll', function () {
			if (ticking) { return; }
			ticking = true;
			window.requestAnimationFrame(alternar);
		}, { passive: true });
		alternar();
	}

	/* Aparición al hacer scroll: una sola vez por elemento. Sin JS o con movimiento reducido todo se ve ya. */
	var items = document.querySelectorAll('[data-reveal]');
	if (items.length) {
		if (reducido || !('IntersectionObserver' in window)) {
			items.forEach(function (el) { el.classList.add('is-seen'); });
		} else {
			var io = new IntersectionObserver(function (es) {
				es.forEach(function (e) {
					if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
				});
			}, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
			items.forEach(function (el) { io.observe(el); });
		}
	}

	/* Índice del artículo: abierto en escritorio, plegado en móvil. */
	var tocDet = document.querySelector('.toc details');
	if (tocDet && window.matchMedia && window.matchMedia('(min-width: 75rem)').matches) { tocDet.open = true; }

	/* Índice del artículo: marca la sección que se está leyendo. */
	var toc = document.querySelector('.toc');
	if (toc && 'IntersectionObserver' in window) {
		var enlaces = {};
		toc.querySelectorAll('a[href^="#"]').forEach(function (a) { enlaces[a.getAttribute('href').slice(1)] = a; });
		var secciones = Array.prototype.slice.call(document.querySelectorAll('.prose h2[id]'));
		var io2 = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) {
					Object.keys(enlaces).forEach(function (k) { enlaces[k].classList.remove('is-active'); });
					if (enlaces[e.target.id]) { enlaces[e.target.id].classList.add('is-active'); }
				}
			});
		}, { rootMargin: '-20% 0px -70% 0px' });
		secciones.forEach(function (h) { io2.observe(h); });
	}

	/* Carrusel de guías: flechas que desplazan una tarjeta. */
	document.querySelectorAll('[data-carrusel]').forEach(function (c) {
		var sec = c.closest('section');
		sec.querySelectorAll('.carrusel__btn').forEach(function (b) {
			b.addEventListener('click', function () {
				var paso = (c.querySelector('.gcard') || c).getBoundingClientRect().width + 20;
				c.scrollBy({ left: paso * Number(b.dataset.dir), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
			});
		});
	});
}());

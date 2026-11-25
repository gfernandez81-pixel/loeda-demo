(function () {
  var es = location.pathname.indexOf('/gl/') !== -1 ? false : true;
  var msg = es ? 'Esto es una demo: la compra se activa en el servidor real.' : 'Isto é unha demo: a compra actívase no servidor real.';
  function aviso() {
    var t = document.getElementById('demo-aviso');
    if (!t) {
      t = document.createElement('div'); t.id = 'demo-aviso'; t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:#ffe490;color:#031f29;padding:14px 22px;border-radius:999px;font:500 14px Roboto,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = 'none'; }, 3500);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="add-to-cart"], button.single_add_to_cart_button, .add_to_cart_button, .wp-block-button__link[href*="add-to-cart"]');
    if (a) { e.preventDefault(); aviso(); }
  }, true);
  document.addEventListener('submit', function (e) { if (e.target.matches('form.cart')) { e.preventDefault(); aviso(); } }, true);
})();

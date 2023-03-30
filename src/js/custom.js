document.addEventListener('DOMContentLoaded', function() {
  if (document.documentElement.getAttribute('data-theme') === null) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

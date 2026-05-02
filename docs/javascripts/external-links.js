// Open external navigation links in new tab
document.addEventListener('DOMContentLoaded', function() {
  // Target all navigation links
  const navLinks = document.querySelectorAll('.md-nav__link');

  navLinks.forEach(function(link) {
    // Check if link is external
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
});

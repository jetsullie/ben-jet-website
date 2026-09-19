// A single entrance glint draws attention without continuous flashing.
  const attentionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('attention-visible');
      attentionObserver.unobserve(entry.target);
    }
  }, { threshold: .7 });
  document.querySelectorAll('[data-attention]').forEach(element => attentionObserver.observe(element));

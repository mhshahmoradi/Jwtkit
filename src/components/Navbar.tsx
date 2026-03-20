const Navbar = () => {
  return (
    <header class="top-nav">
      <div class="brand">
        <div class="brand-dot" />
        <span>JWT Debugger</span>
      </div>
      <nav>
        <a class="active" href="#">Debugger</a>
        <a href="#">Introduction</a>
        <a href="#">Libraries</a>
        <a href="#">Ask</a>
      </nav>
      <div class="top-actions">
        <button type="button" class="icon-btn" aria-label="Messages">
          💬
        </button>
        <button type="button" class="icon-btn" aria-label="Theme">
          ☾
        </button>
      </div>
    </header>
  )
}

export default Navbar

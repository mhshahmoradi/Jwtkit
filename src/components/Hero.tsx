const Hero = () => {
  return (
    <section class="hero-section">
      <p>
        Decode, verify, and generate JSON Web Tokens, which are an open, industry standard RFC 7519
        method for representing claims securely between two parties.
      </p>
      <div class="mode-switch" role="tablist" aria-label="Mode switch">
        <button type="button" class="active">JWT Decoder</button>
        <button type="button">JWT Encoder</button>
      </div>
    </section>
  )
}

export default Hero

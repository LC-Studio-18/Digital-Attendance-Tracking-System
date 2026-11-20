@extends('layouts.app')

@section('title', 'Loading, error & success states')

@section('content')
  <div class="app">
    <header class="hero">
      <p class="hero__kicker">S1-16 · Laravel port</p>
      <h1>Loading, error &amp; success states</h1>
      <p class="hero__lede">
        The same reusable feedback patterns as the React preview, rendered by Blade.
        Friendly copy only — never raw errors, status codes or stack traces.
      </p>
    </header>

    <section class="section">
      <h2>Loader</h2>
      <x-loader label="Loading live attendance…" size="lg" />
      <x-loader label="Clocking in…" size="sm" inline />
    </section>

    <section class="section">
      <h2>Error messages</h2>
      <x-error-message code="invalid-credentials" />
      <x-error-message code="403" />
      <x-error-message code="duplicate-clock-in" />
      <x-error-message code="offline" :retry-url="route('attendance.history')" />
      <x-error-message code="500" :retry-url="route('attendance.history')" />
    </section>

    <section class="section">
      <h2>Success messages</h2>
      <x-success-message message="You're clocked in. Have a good day!" />
      <x-success-message title="Clocked in" message="Your arrival time was recorded at 09:02." />
    </section>
  </div>
@endsection

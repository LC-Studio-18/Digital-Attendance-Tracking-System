<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title', 'Digital Attendance')</title>
  <link rel="stylesheet" href="{{ asset('css/base.css') }}">
  <link rel="stylesheet" href="{{ asset('css/components.css') }}">
  <link rel="stylesheet" href="{{ asset('css/app.css') }}">
  <link rel="stylesheet" href="{{ asset('css/attendance-history.css') }}">
  <link rel="stylesheet" href="{{ asset('css/export-csv.css') }}">
</head>
<body>
  <header class="hero">
    <nav class="section-nav" aria-label="Main navigation">
      <a href="{{ route('home') }}">Components</a>
      <a href="{{ route('attendance.history') }}">Attendance history</a>
    </nav>
  </header>

  <main>
    @yield('content')
  </main>

  <footer class="footer">
    <p>Digital Attendance Tracking System · Laravel frontend (Rasool's work)</p>
  </footer>
</body>
</html>

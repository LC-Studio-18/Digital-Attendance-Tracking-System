@props(['filename' => 'attendance-report.csv', 'label' => 'Export CSV'])

<div class="export-csv">
  <form class="export-csv__form" method="GET" action="{{ route('reports.export') }}">
    <div class="export-csv__fields">
      <label class="export-csv__field">
        <span class="export-csv__label">Start date</span>
        <input type="date" class="export-csv__input" name="startDate" aria-label="Start date">
      </label>
      <label class="export-csv__field">
        <span class="export-csv__label">End date</span>
        <input type="date" class="export-csv__input" name="endDate" aria-label="End date">
      </label>
    </div>

    <button type="submit" class="export-csv__button">
      <span>{{ $label }}</span>
    </button>
  </form>

  <p class="export-csv__note">
    Downloads {{ $filename }} from the attendance array shared by the history page.
  </p>

  @if(session('export_error'))
    <x-error-message :message="session('export_error')" />
  @endif
</div>

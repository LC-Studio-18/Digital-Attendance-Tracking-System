@props([
  'filters' => [],
  'dateMode' => 'range',
  'employees' => [],
  'isAdmin' => false,
  'error' => null,
])

@php
  $specificDisabled = $dateMode !== \App\Services\AttendanceFilters::MODE_SPECIFIC;
  $rangeDisabled = $dateMode !== \App\Services\AttendanceFilters::MODE_RANGE;
@endphp

<form class="history-filters" method="GET" action="{{ route('attendance.history') }}" novalidate>
  <div class="history-filters__fields">
    <label class="history-filters__field">
      <span class="history-filters__label">Date filter</span>
      <select class="history-filters__input" name="date_mode" aria-label="Date filter">
        <option value="range" @selected($dateMode === 'range')>Date range</option>
        <option value="specific" @selected($dateMode === 'specific')>Specific date</option>
        <option value="any" @selected($dateMode === 'any')>Any date</option>
      </select>
    </label>

    <label class="history-filters__field">
      <span class="history-filters__label">Date</span>
      <input type="date" class="history-filters__input" name="date" aria-label="Date"
        value="{{ $filters['date'] ?? '' }}" @disabled($specificDisabled)>
    </label>

    <label class="history-filters__field">
      <span class="history-filters__label">From</span>
      <input type="date" class="history-filters__input" name="start_date" aria-label="From"
        value="{{ $filters['startDate'] ?? '' }}" @disabled($rangeDisabled)>
    </label>

    <label class="history-filters__field">
      <span class="history-filters__label">To</span>
      <input type="date" class="history-filters__input" name="end_date" aria-label="To"
        value="{{ $filters['endDate'] ?? '' }}" @disabled($rangeDisabled)>
    </label>

    <label class="history-filters__field">
      <span class="history-filters__label">Status</span>
      <select class="history-filters__input" name="status" aria-label="Status">
        <option value="" @selected(($filters['status'] ?? '') === '')>All statuses</option>
        <option value="IN" @selected(($filters['status'] ?? '') === 'IN')>IN</option>
        <option value="OUT" @selected(($filters['status'] ?? '') === 'OUT')>OUT</option>
      </select>
    </label>

    <label class="history-filters__field">
      <span class="history-filters__label">Search</span>
      <input type="search" class="history-filters__input" name="search" aria-label="Search"
        placeholder="Name, email or department" value="{{ $filters['search'] ?? '' }}">
    </label>

    @if($isAdmin)
      <label class="history-filters__field history-filters__field--wide">
        <span class="history-filters__label">Employee</span>
        <input type="search" class="history-filters__input" name="employee" aria-label="Employee"
          list="employee-options" placeholder="Search or select an employee"
          value="{{ $filters['employee'] ?? '' }}">
        <datalist id="employee-options">
          @foreach($employees as $employee)
            <option value="{{ $employee['value'] }}" label="{{ $employee['label'] }}"></option>
          @endforeach
        </datalist>
      </label>
    @endif
  </div>

  <div class="history-filters__actions">
    <button type="submit" class="history-filters__button history-filters__button--apply">Apply filters</button>
    <a class="history-filters__button history-filters__button--clear" href="{{ route('attendance.history') }}">Clear filters</a>
  </div>

  @if($error)
    <p class="history-filters__error" role="alert">{{ $error }}</p>
  @endif
</form>

@php
  use App\Services\AttendanceFilters;
  use App\Services\CsvExporter;
@endphp

@extends('layouts.app')

@section('title', 'Attendance history')

@section('content')
  @php
    $labels = [
      'staff' => 'Staff',
      'email' => 'Email',
      'department' => 'Department',
      'date' => 'Date',
      'clockIn' => 'Clock in',
      'clockOut' => 'Clock out',
      'duration' => 'Hours',
      'status' => 'Status',
    ];
  @endphp

  <div class="history-page">
    <header class="history-page__header">
      <div>
        <p class="history-page__kicker">Attendance</p>
        <h1 class="history-page__title">Attendance history</h1>
        <p class="history-page__subtitle">
          {{ $isAdmin ? 'Review clock-in and clock-out records for all staff.' : 'Review your clock-in and clock-out records.' }}
        </p>
      </div>
      <div class="history-page__actions">
        <span class="history-role{{ $isAdmin ? ' history-role--admin' : '' }}">
          {{ $isAdmin ? 'Admin view' : 'Staff view' }}
        </span>
        <a class="history-refresh" href="{{ route('attendance.history') }}">Refresh</a>
      </div>
    </header>

    <section class="history-filters-card" aria-label="Filter attendance history">
      <h2 class="history-filters-card__title">Filters</h2>
      <x-history-filters
        :filters="$filters"
        :date-mode="$dateMode"
        :employees="$employees"
        :is-admin="$isAdmin"
        :error="$filterError"
      />
    </section>

    <section class="history-card" aria-label="Attendance history">
      <div class="history-card__head">
        <h2>Records</h2>
        @if(count($records) > 0)
          <span class="history-card__count">
            {{ count($records) }} {{ count($records) === 1 ? 'record' : 'records' }}
          </span>
        @endif
      </div>

      @if($errorMessage)
        <div class="history-feedback">
          <x-error-message :message="$errorMessage" :retry-url="route('attendance.history')" />
        </div>
      @endif

      @if(count($records) === 0 && ! $errorMessage && ! $filterError)
        <div class="history-empty">
          <h3 class="history-empty__title">
            {{ $isFiltered ? 'No records match your filters' : 'No attendance records yet' }}
          </h3>
          <p class="history-empty__text">
            {{ $isFiltered ? 'Try a different date range, status or search term.' : 'When a staff member clocks in or out, their record will appear here.' }}
          </p>
          <a class="history-refresh" href="{{ route('attendance.history') }}">
            {{ $isFiltered ? 'Clear filters' : 'Refresh' }}
          </a>
        </div>
      @endif

      @if(count($records) > 0)
        <div class="history-table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                @foreach($columns as $key)
                  <th scope="col">{{ $labels[$key] ?? $key }}</th>
                @endforeach
              </tr>
            </thead>
            <tbody>
              @foreach($records as $record)
                <tr>
                  @foreach($columns as $key)
                    <td>
                      @switch($key)
                        @case('date')
                          {{ CsvExporter::formatDate(AttendanceFilters::getField($record, 'date', 'createdAt', 'timestamp')) }}
                          @break
                        @case('clockIn')
                          {{ CsvExporter::formatTime(AttendanceFilters::getField($record, 'clockIn', 'checkIn', 'inTime')) }}
                          @break
                        @case('clockOut')
                          {{ CsvExporter::formatTime(AttendanceFilters::getField($record, 'clockOut', 'checkOut', 'outTime')) }}
                          @break
                        @case('duration')
                          {{ CsvExporter::duration($record) }}
                          @break
                        @case('status')
                          @php($status = AttendanceFilters::getRecordStatus($record))
                          <span class="history-status history-status--{{ $status === 'IN' ? 'in' : 'out' }}">{{ $status }}</span>
                          @break
                        @case('staff')
                          {{ CsvExporter::textOrDash(AttendanceFilters::getField($record, 'staffName', 'employeeName', 'name', 'user.name')) }}
                          @break
                        @case('email')
                          {{ CsvExporter::textOrDash(AttendanceFilters::getField($record, 'email', 'staffEmail', 'user.email')) }}
                          @break
                        @case('department')
                          {{ CsvExporter::textOrDash(AttendanceFilters::getField($record, 'department', 'team')) }}
                          @break
                      @endswitch
                    </td>
                  @endforeach
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      @endif
    </section>

    <section class="history-card" aria-label="Data sharing">
      <h2>Data sharing</h2>
      <p>The records above are published to the shared attendance store for CSV export.</p>
      <x-export-csv />
    </section>
  </div>
@endsection

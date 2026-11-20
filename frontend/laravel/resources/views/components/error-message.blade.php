@props([
  'code' => null,
  'message' => null,
  'retryUrl' => null,
])

@php($text = $message ?? \App\Services\ErrorMessages::resolve($code))

<div class="error-message" role="alert">
  <p class="error-message__text">{{ $text }}</p>
  @if($retryUrl)
    <a class="history-refresh" href="{{ $retryUrl }}">Try again</a>
  @endif
  {{ $slot ?? '' }}
</div>

@props(['label' => 'Loading…', 'size' => 'md', 'inline' => false])

<span
  class="loader loader--{{ $size }}{{ $inline ? ' loader--inline' : '' }}"
  role="status"
  aria-live="polite"
>
  <span class="loader__spinner" aria-hidden="true"></span>
  <span class="loader__label">{{ $label }}</span>
</span>

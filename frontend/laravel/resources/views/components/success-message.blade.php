@props(['message' => '', 'title' => null])

<div class="success-message" role="status">
  @if($title)
    <strong class="success-message__title">{{ $title }}</strong>
  @endif
  <p class="success-message__text">{{ $message }}</p>
</div>

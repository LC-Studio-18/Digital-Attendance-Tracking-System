<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class FeedbackController extends Controller
{
    public function index(): View
    {
        return view('feedback-previews');
    }
}

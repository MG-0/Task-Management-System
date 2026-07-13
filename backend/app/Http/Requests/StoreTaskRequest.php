<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query){
                    $query->where('user_id', $this->user()->id);
                })

            ],
            'title'       => 'required|string|max:255',
        'description' => 'nullable|string',
        'status'      => 'sometimes|string|in:pending,in_progress,completed',
        'priority'    => 'sometimes|string|in:low,medium,high',
        'due_date'    => 'nullable|date|after_or_equal:today',
        ];
    }
}

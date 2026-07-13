<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['title', 'description', 'status', 'priority', 'due_date', 'category_id', 'user_id', 'assigned_to'])]
class Task extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }

    public function assignee()
{
    
    return $this->belongsTo(User::class, 'assigned_to');
}
}

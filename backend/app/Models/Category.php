<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\ScopedBy; // لو هتستخدم الـ Attributes
use Illuminate\Database\Eloquent\Attributes\Fillable;
use App\Models\Task;


#[Fillable(['name', 'color', 'user_id'])]
class Category extends Model
{
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function tasks()
{
    return $this->hasMany(Task::class);
}
}

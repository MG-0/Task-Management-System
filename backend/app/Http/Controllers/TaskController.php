<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->tasks();
        if ($request->has('category_id')) {
            $query = $query->where("category_id", $request->category_id);
        }

        if ($request->has('status')) {
             $query->where('status', $request->status);
        }
        return TaskResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $task = auth()->user()->tasks()->create($request->validated());
        return response()->json([
            'message' => 'Task created successfully',
            'task' => new TaskResource($task)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        if ($task->user_id !== auth()->id()) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        if ($task->user_id !== auth()->id()) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

      $task->update($request->validated());
        return response()->json([
            'message' => 'Task updated successfully',
            'task' => new TaskResource($task)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
         if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
         $task->delete();
        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    public function assign(Request $request, Task $task){
        if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $task->assigned_to = $request->assigned_to;
        $task->save();
        return response()->json([
            'message' => 'Task assigned successfully',
            'task' => new TaskResource($task)
        ]);
    }

    public function updateStatus(Request $request, Task $task){
            if ($task->user_id !== auth()->id() && $task->assigned_to !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
          'status' => 'required|string|in:pending,in_progress,completed'
        ]);
         $task->status = $request->status;
        $task->save();
        return response()->json([
            'message' => 'Task status updated successfully',
            'task' => new TaskResource($task)
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;



class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = auth()->user()->categories()->get();
        return CategoryResource::collection($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $ctegory = auth()->user()->categories()->create($request->validated());
        return response()->json([
            'message' => 'Category created successfully',
            'category' => new CategoryResource($ctegory)
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        if($category->user_id !== auth()->id()  ){
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }
        return response()->json([
            'message' => 'Categories Showed Successfully',
            "category" => new CategoryResource($category)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
         if($category->user_id !== auth()->id()  ){
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $category->update($request->validated());
        return response()->json([
            'message' => 'Category updated successfully',
            'category' => new CategoryResource($category)
        ]);
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
          if($category->user_id !== auth()->id()  ){
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }
        $category->delete();
         return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}

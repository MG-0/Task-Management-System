<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;


class ProfileController extends Controller
{
    
    public function update(UpdateProfileRequest $request){
        // Get User who login 
        $user = auth()->user();

        // edit name if it sending  // put on password if it sending
        if($request->filled('name') ){
            $user->name = $request->name;
           
        }

        if($request->filled('password')){
             $user->password = $request->password;
        }

        // Save Edits in DB
        $user->save();

        // Return Response 
        return response()->json([
            'message' => 'Profile updated successfully',
            "user" => new UserResource($user)
        ]);
 
    }

    public function uploadAvatar(Request $request) {
        $request->validate([
            "avatar" => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);
        $user = auth()->user();

        if($user->avatar){
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar = $path;
        $user->save();

    return response()->json([
         'message' => 'Avatar uploaded successfully',
            'user'=> new UserResource($user)
         ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Password;


class AuthController extends Controller
{
    
     public function register(RegisterRequest $request){
        // Create New User
        $user = User::create([
            "name" => $request->name,
            "email"=> $request->email,
            "password" => $request-> password
        ]);

        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "token"=> $token,
            "user"=> new UserResource($user)
        ]);
     }

     public function login(LoginRequest $request){
        if(!auth()->attempt($request->only("email", "password"))){
            return response()->json([
                "message" => 'Invalid credentials'
            ], 401);
        }

        $user = auth()->user();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            "token" => $token,
            "user"=> new UserResource($user)
        ]);
     }


     public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
     
        return response()->json([
            "message"=> "Logout Successfuly"
        ], 200);
     
        }

        public function me() {
            $user = auth()->user();
            return response()->json([
                "user" => new UserResource($user)
               
            ]);
        }


    public function forgotPassword(Request $request){
        $request->validate([
            "email" => "required|email"
        ]);

        $status = Password::sendResetLink(
            $request->only("email")
        );

        return response()->json([
            "message" => __($status)
        ]);
    }

    public function resetPassword(Request $request){
        $request->validate([
            "token"=> 'required',
            "email" => 'required|email',
            "password" => 'required|string|min:8|confirmed'
        ]);

        $status = Password::reset(
            $request->only("email", "password", "password_confirmation", 'token'),
            function ($user, $password) {
                $user->password = $password;
                $user->save();
            }
        );
        return response()->json([
            "message"=> __($status)
        ]);

    }




}

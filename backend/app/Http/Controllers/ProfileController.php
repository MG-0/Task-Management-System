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
            "avatar" => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:2048'
        ]);

        $user = auth()->user();
        $file = $request->file('avatar');

        $user->avatar = $this->processAvatarAsBase64($file);
        $user->save();

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'user'=> new UserResource($user)
        ]);
    }

    private function processAvatarAsBase64($file): string
    {
        $realPath = $file->getRealPath();
        $mime = $file->getMimeType() ?: 'image/jpeg';

        // Attempt resize with GD if available to keep database payload light (~15-30KB)
        if (extension_loaded('gd') && function_exists('imagecreatefromstring')) {
            try {
                $raw = file_get_contents($realPath);
                $img = @imagecreatefromstring($raw);
                if ($img !== false) {
                    $width = imagesx($img);
                    $height = imagesy($img);
                    $maxDim = 256;

                    if ($width > $maxDim || $height > $maxDim) {
                        $ratio = min($maxDim / $width, $maxDim / $height);
                        $newWidth = max(1, (int)($width * $ratio));
                        $newHeight = max(1, (int)($height * $ratio));

                        $resized = imagecreatetruecolor($newWidth, $newHeight);
                        imagealphablending($resized, false);
                        imagesavealpha($resized, true);

                        imagecopyresampled($resized, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                        ob_start();
                        imagejpeg($resized, null, 85);
                        $compressed = ob_get_clean();

                        if ($compressed) {
                            return 'data:image/jpeg;base64,' . base64_encode($compressed);
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Fallback to direct file encoding if resize fails
            }
        }

        $contents = file_get_contents($realPath);
        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }
}

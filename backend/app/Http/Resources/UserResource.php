<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $avatar = $this->avatar;
        if ($avatar) {
            if (str_starts_with($avatar, 'data:') || str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
                // Keep data URL or external URL as-is
            } elseif (file_exists(public_path('storage/' . $avatar))) {
                $avatar = url('storage/' . $avatar);
            } else {
                $avatar = null;
            }
        }

        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "avatar" => $avatar,
            "created_at" => $this->created_at,
            "updated_at"=> $this->updated_at,
        ];
    }
}

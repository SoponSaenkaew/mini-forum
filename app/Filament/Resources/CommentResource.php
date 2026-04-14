<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CommentResource\Pages;
use App\Filament\Resources\CommentResource\RelationManagers;
use App\Models\Comment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CommentResource extends Resource
{
    protected static ?string $navigationGroup = 'Community Management';

    protected static ?string $model = Comment::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $recordTitleAttribute = 'content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('ผู้เขียน')->searchable(),
                Tables\Columns\TextColumn::make('post.title')->label('โพสต์ที่เกี่ยวข้อง')->limit(30),
                Tables\Columns\TextColumn::make('content')->label('ข้อความ')->limit(50)->searchable(),
                // ✨ แสดงป้ายกำกับว่าเป็น "การตอบกลับ" หรือไม่
                Tables\Columns\IconColumn::make('parent_id')
                    ->label('ประเภท')
                    ->boolean()
                    ->trueIcon('heroicon-o-chat-bubble-left-right')
                    ->falseIcon('heroicon-o-chat-bubble-left')
                    ->trueColor('warning')
                    ->falseColor('success'),
                Tables\Columns\TextColumn::make('created_at')->label('เวลา')->since(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_reply')
                    ->label('แสดงเฉพาะการตอบกลับ')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('parent_id'),
                        false: fn ($query) => $query->whereNull('parent_id'),
                    ),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListComments::route('/'),
            'create' => Pages\CreateComment::route('/create'),
            'edit' => Pages\EditComment::route('/{record}/edit'),
        ];
    }
}

<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Filament\Resources\PostResource\RelationManagers;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

use Filament\Forms\Components\Repeater; 
use Filament\Forms\Components\FileUpload;

class PostResource extends Resource
{
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
    
    protected static ?string $model = Post::class;

    protected static ?string $navigationGroup = 'Community Management';

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // --- ก้อนที่ 1: ข้อมูลโพสต์และรูปภาพ ---
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('เนื้อหาโพสต์')
                            ->schema([
                                Forms\Components\TextInput::make('title')
                                    ->required()
                                    ->label('หัวข้อ'),
                                Forms\Components\RichEditor::make('content')
                                    ->required()
                                    ->label('เนื้อหา'),
                            ]),

                        Forms\Components\Section::make('รูปภาพประกอบ')
                            ->schema([
                                // ✨ ใช้ Repeater ที่ถูกต้องสำหรับจัดการความสัมพันธ์ HasMany
                                Repeater::make('images') 
                                    ->relationship('images') 
                                    ->schema([
                                        FileUpload::make('image_path')
                                            ->image()
                                            ->directory('posts')
                                            ->required()
                                            ->label('เลือกรูปภาพ'),
                                    ])
                                    ->grid(2)
                                    ->reorderable()
                                    ->label('รายการรูปภาพ')
                                    ->maxItems(5),
                            ]),
                    ])->columnSpan(['lg' => 2]),

                // --- ก้อนที่ 2: ข้อมูลเจ้าของโพสต์ (Sidebar) ---
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('การจัดการ')
                            ->schema([
                                Forms\Components\Select::make('user_id')
                                    ->relationship('user', 'name')
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->label('เจ้าของโพสต์'),
                            ]),
                    ])->columnSpan(['lg' => 1]),
            ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('เจ้าของโพสต์')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('title')
                    ->label('หัวข้อ')
                    ->searchable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('comments_count')
                    ->counts('comments')
                    ->label('จำนวนคอมเมนต์')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('สร้างเมื่อ')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('user')
                    ->relationship('user', 'name')
                    ->label('กรองตามผู้ใช้งาน'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([ // ✨ จุดที่ 2: เพิ่มปุ่มกดท้ายแถว
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(), // ปุ่มกู้คืน
                Tables\Actions\ForceDeleteAction::make(), // ปุ่มลบถาวร
            ])
            ->bulkActions([ // ✨ จุดที่ 3: เพิ่มกลุ่มปุ่มจัดการทีละหลายๆ โพสต์
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}

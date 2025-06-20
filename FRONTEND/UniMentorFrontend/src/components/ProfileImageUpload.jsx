import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Check, Move } from 'lucide-react';

export default function ProfileImageUpload({ profileImage, name, onImageChange }) {
    const [previewImage, setPreviewImage] = useState(profileImage);
    console.log("ssdd",previewImage);
    
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [cropData, setCropData] = useState({
        x: 0,
        y: 0,
        size: 200
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        if (profileImage) {
            setPreviewImage(profileImage);
        }
    }, [profileImage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setShowUploadModal(false);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageLoad = () => {
        if (imageRef.current) {
            const { offsetWidth, offsetHeight } = imageRef.current;
            setImageSize({ width: offsetWidth, height: offsetHeight });
            
            // Center the crop area and make it a good size
            const cropSize = Math.min(offsetWidth, offsetHeight) * 0.7;
            setCropData({
                x: (offsetWidth - cropSize) / 2,
                y: (offsetHeight - cropSize) / 2,
                size: cropSize
            });
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - cropData.x,
            y: e.clientY - cropData.y
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            
            setCropData(prev => ({
                ...prev,
                x: Math.max(0, Math.min(imageSize.width - prev.size, newX)),
                y: Math.max(0, Math.min(imageSize.height - prev.size, newY))
            }));
        }
    }, [isDragging, dragStart, imageSize]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const cropImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = imageRef.current;
        
        if (!canvas || !ctx || !image) return;

        const { x, y, size } = cropData;
        
        // Set canvas size to desired output size
        const outputSize = 300;
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // Calculate source dimensions
        const scaleX = image.naturalWidth / image.offsetWidth;
        const scaleY = image.naturalHeight / image.offsetHeight;
        
        const sourceX = x * scaleX;
        const sourceY = y * scaleY;
        const sourceSize = size * Math.min(scaleX, scaleY);
        
        // Clear canvas and draw the cropped image
        ctx.clearRect(0, 0, outputSize, outputSize);
        ctx.drawImage(
            image,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, outputSize, outputSize
        );
        
        // Convert to blob and update preview
        canvas.toBlob((blob) => {
            if (blob) {
                console.log("b;o",blob);
                
                const croppedImageUrl = URL.createObjectURL(blob);
                console.log("canvas",croppedImageUrl);
                
                setPreviewImage(croppedImageUrl);
                onImageChange(blob);
                setShowCropModal(false);
            }
        }, 'image/jpeg', 0.9);
    };

    const cancelUpload = () => {
        setShowUploadModal(false);
        setShowCropModal(false);
        setSelectedImage(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const defaultImage = name?.charAt(0).toUpperCase();
    const imageUrl = previewImage?.startsWith('data:image') || previewImage?.startsWith('http') || previewImage?.startsWith('blob:')
        ? previewImage
        : `http://localhost:3047${previewImage}`;

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Profile Image Display */}
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    {imageUrl && previewImage ? (
                        <img 
                            src={imageUrl}
                            alt='profile'
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600">
                                {defaultImage || 'U'}
                            </span>
                        </div>
                    )}
                    
                    {imageUrl && previewImage && (
                        <div 
                            className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center absolute inset-0"
                            style={{ display: 'none' }}
                        >
                            <span className="text-2xl font-bold text-gray-600">
                                {defaultImage || 'U'}
                            </span>
                        </div>
                    )}
                </div>

                <button 
                    type="button" 
                    onClick={() => setShowUploadModal(true)}
                    aria-label="Edit profile Picture"
                    className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                    <Camera size={16} />
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Profile Picture</p>
                <p className="text-xs text-gray-500 mt-1">
                    Click camera icon to update
                </p>
            </div>

            <input 
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Update Profile Picture</h3>
                            <button 
                                onClick={cancelUpload}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={triggerFileInput}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <Camera size={18} />
                                Choose from Device
                            </button>
                            
                            <button 
                                onClick={cancelUpload}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Crop Modal */}
            {showCropModal && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Choose Profile Picture Area</h3>
                            <button 
                                onClick={cancelUpload}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div className="p-6">
                            <div className="relative inline-block mx-auto">
                                <img
                                    ref={imageRef}
                                    src={selectedImage}
                                    alt="Selected"
                                    className="max-w-full max-h-96 object-contain"
                                    onLoad={handleImageLoad}
                                />
                                
                                {/* Crop Selection Box */}
                                {imageSize.width > 0 && (
                                    <div
                                        className="absolute border-4 border-blue-500 cursor-move"
                                        style={{
                                            left: cropData.x,
                                            top: cropData.y,
                                            width: cropData.size,
                                            height: cropData.size,
                                            borderRadius: '50%',
                                            backgroundColor: 'transparent',
                                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), inset 0 0 0 2px rgba(255, 255, 255, 0.8)'
                                        }}
                                        onMouseDown={handleMouseDown}
                                    >
                                        {/* Center crosshair indicator */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-4 h-0.5 bg-blue-500 absolute top-0 left-1/2 transform -translate-x-1/2" />
                                            <div className="w-0.5 h-4 bg-blue-500 absolute top-1/2 left-0 transform -translate-y-1/2" />
                                        </div>
                                        
                                        {/* Corner grab handles */}
                                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        
                                        {/* Side grab handles */}
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="px-6 pb-4">
                            <div className="text-center text-sm text-gray-600">
                                <p className="flex items-center justify-center gap-2">
                                    <Move size={14} />
                                    Drag the circle to select which part of your photo to use
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <button 
                                onClick={cancelUpload}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            
                            <button 
                                onClick={cropImage}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                                <Check size={16} />
                                Use This Area
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
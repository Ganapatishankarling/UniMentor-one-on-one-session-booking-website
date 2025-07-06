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
        <div className="flex flex-col items-center space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-100">
            {/* Profile Image Display */}
            <div className="relative group">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                            <span className="text-4xl font-bold text-emerald-600">
                                {defaultImage || 'U'}
                            </span>
                        </div>
                    )}
                    
                    {imageUrl && previewImage && (
                        <div 
                            className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center absolute inset-0"
                            style={{ display: 'none' }}
                        >
                            <span className="text-4xl font-bold text-emerald-600">
                                {defaultImage || 'U'}
                            </span>
                        </div>
                    )}
                </div>

                <button 
                    type="button" 
                    onClick={() => setShowUploadModal(true)}
                    aria-label="Edit profile Picture"
                    className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 border-4 border-white hover:shadow-xl"
                >
                    <Camera size={20} />
                </button>
            </div>

            <div className="text-center bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4">
                <p className="text-lg text-gray-900 font-bold mb-1">Profile Picture</p>
                <p className="text-sm text-gray-600">
                    Click camera icon to update your profile image
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
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-5 border-b border-emerald-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-emerald-900">Update Profile Picture</h3>
                                <button 
                                    onClick={cancelUpload}
                                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-xl transition-all duration-200 text-emerald-700 hover:text-emerald-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <button 
                                onClick={triggerFileInput}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Camera size={20} />
                                Choose from Device
                            </button>
                            
                            <button 
                                onClick={cancelUpload}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-200 hover:border-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Crop Modal */}
            {showCropModal && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-5 border-b border-emerald-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-emerald-900">Choose Profile Picture Area</h3>
                                <button 
                                    onClick={cancelUpload}
                                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-xl transition-all duration-200 text-emerald-700 hover:text-emerald-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Crop Area */}
                        <div className="p-8 bg-gray-50">
                            <div className="relative inline-block mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
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
                                        className="absolute border-4 border-emerald-600 cursor-move"
                                        style={{
                                            left: cropData.x,
                                            top: cropData.y,
                                            width: cropData.size,
                                            height: cropData.size,
                                            borderRadius: '50%',
                                            backgroundColor: 'transparent',
                                            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2), inset 0 0 0 2px rgba(255, 255, 255, 0.9)'
                                        }}
                                        onMouseDown={handleMouseDown}
                                    >
                                        {/* Center crosshair indicator */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-6 h-0.5 bg-emerald-600 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full" />
                                            <div className="w-0.5 h-6 bg-emerald-600 absolute top-1/2 left-0 transform -translate-y-1/2 rounded-full" />
                                        </div>
                                        
                                        {/* Corner grab handles */}
                                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        
                                        {/* Side grab handles */}
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-lg" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="px-8 pb-4 bg-gray-50">
                            <div className="text-center bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                                <p className="flex items-center justify-center gap-2 text-emerald-800 font-medium">
                                    <Move size={16} />
                                    Drag the circle to select which part of your photo to use
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-100 bg-white">
                            <button 
                                onClick={cancelUpload}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 border border-gray-200 hover:border-gray-300"
                            >
                                Cancel
                            </button>
                            
                            <button 
                                onClick={cropImage}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
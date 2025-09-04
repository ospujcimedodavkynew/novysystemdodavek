import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface SignaturePadRef {
  clear: () => void;
  getSignature: () => string | undefined;
}

const SignaturePad = forwardRef<SignaturePadRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    contextRef.current = context;
  }, []);

  const getCoords = (event: MouseEvent | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
  }

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const nativeEvent = event.nativeEvent;
    const coords = getCoords('touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(coords.offsetX, coords.offsetY);
    isDrawing.current = true;
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    isDrawing.current = false;
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const nativeEvent = event.nativeEvent;
    // prevent scrolling while drawing on touch devices
    if ('touches' in nativeEvent) {
        event.preventDefault();
    }
    const coords = getCoords('touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent);
    contextRef.current?.lineTo(coords.offsetX, coords.offsetY);
    contextRef.current?.stroke();
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    getSignature: () => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        // Check if canvas is empty
        const context = canvas.getContext('2d');
        if(!context) return undefined;
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        const isEmpty = !pixelBuffer.some(color => color !== 0);

        return isEmpty ? undefined : canvas.toDataURL('image/png');
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      onMouseLeave={finishDrawing}
      onTouchStart={startDrawing}
      onTouchEnd={finishDrawing}
      onTouchMove={draw}
      className="bg-gray-800 border border-gray-600 rounded-md w-full max-w-sm h-32 cursor-crosshair touch-none"
    />
  );
});

export default SignaturePad;
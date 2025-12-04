import Lottie from 'lottie-react';
import { CSSProperties } from 'react';
import './LoadingAnimation.css';

interface LoadingAnimationProps {
  animationData?: object;
  width?: number | string;
  height?: number | string;
}

/**
 * LoadingAnimation - Displays a Lottie animation
 */
export default function LoadingAnimation({
  animationData,
  width = 200,
  height = 200,
}: LoadingAnimationProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  };

  const animationStyle: CSSProperties = {
    width,
    height,
  };

  // If no animation data provided, show nothing
  if (!animationData) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={animationStyle}
      />
    </div>
  );
}

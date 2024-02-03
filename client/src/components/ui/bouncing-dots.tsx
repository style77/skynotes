type BouncingDotsLoaderProps = {
  className?: string;
  dotsBackground?: string;
}

export const BouncingDotsLoader = (props: BouncingDotsLoaderProps) => {
  return (
    <div className={`flex justify-center m-10 ${props.className}`}>
      <div className={`w-4 h-4 mx-1 rounded-full ${props.dotsBackground ? props.dotsBackground : "bg-gray-400"} opacity-100 animate-bouncing-loader`}></div>
      <div className={`w-4 h-4 mx-1 rounded-full ${props.dotsBackground ? props.dotsBackground : "bg-gray-400"} opacity-100 animate-bouncing-loader delay-200`}></div>
      <div className={`w-4 h-4 mx-1 rounded-full ${props.dotsBackground ? props.dotsBackground : "bg-gray-400"} opacity-100 animate-bouncing-loader delay-400`}></div>
    </div>
  );
};
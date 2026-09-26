import ApexCharts from 'apexcharts';
import { useEffect, useRef } from 'react';

type ApexChartProps = {
	className?: string;
	/** Memoize these (useMemo): the chart is rebuilt whenever the object changes. */
	options: ApexCharts.ApexOptions;
};

/**
 * Small wrapper around ApexCharts: creates the chart on mount, rebuilds it when the
 * options change, and cleans it up on unmount. Replaces the ref/destroy boilerplate.
 */
function ApexChart({ className, options }: ApexChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const chart = new ApexCharts(containerRef.current, options);
		void chart.render();

		return () => {
			chart.destroy();
		};
	}, [options]);

	return <div className={className} ref={containerRef} />;
}

export default ApexChart;

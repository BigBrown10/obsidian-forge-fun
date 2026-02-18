import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

export default function TradingChart({
    data,
    colors = {
        backgroundColor: '#0A0A0B',
        lineColor: '#2962FF',
        textColor: 'rgba(255, 255, 255, 0.5)',
        areaTopColor: 'rgba(41, 98, 255, 0.28)',
        areaBottomColor: 'rgba(41, 98, 255, 0.01)', // gradient
    }
}: { data: any[], colors?: any }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.backgroundColor },
                textColor: colors.textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
        });

        // Candle Series (v5 API)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#4caf50',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#4caf50',
            wickDownColor: '#ef5350',
        });

        // Mock Data if empty
        const initialData = data.length > 0 ? data : generateMockData();
        candleSeries.setData(initialData);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, colors]);

    return (
        <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
    );
}



// Helper to generate realistic looking crypto candle data
function generateMockData() {
    const initialDate = new Date().getTime() / 1000 - (60 * 60 * 24); // 24h ago
    const data = [];
    let price = 0.00042;
    for (let i = 0; i < 100; i++) {
        const open = price;
        const close = price + (Math.random() - 0.5) * 0.00005;
        const high = Math.max(open, close) + Math.random() * 0.00002;
        const low = Math.min(open, close) - Math.random() * 0.00002;

        data.push({
            time: initialDate + (i * 900), // 15m candles
            open,
            high,
            low,
            close,
        });
        price = close;
    }
    return data;
}

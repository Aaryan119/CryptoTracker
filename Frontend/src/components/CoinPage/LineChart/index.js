import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, // For X-axis labels (dates/names)
  LinearScale,   // For Y-axis numerical values
  PointElement,  // For the points on the line
  LineElement,   // For the line itself
  Title,         // Optional: if you use chart titles
  Tooltip,       // For hover tooltips
  Legend,        // For the legend (labels like Bitcoin/Ethereum)
} from 'chart.js'; // Import from 'chart.js'

// --- REGISTER THE REQUIRED COMPONENTS ---
// This needs to be done once before any chart using these components is rendered.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// --------------------------------------

function LineChart({ chartData, multiAxis }) { // Receive chartData and multiAxis props

  const options = {
    plugins: {
      legend: {
        // Show legend only if multiAxis is true (or adjust based on your needs)
        display: multiAxis || chartData?.datasets?.length > 1, // Show if multi or more than 1 dataset
      },
      tooltip: { // Ensure tooltips are enabled
         enabled: true,
      }
    },
    responsive: true,
    interaction: {
      mode: "index", // Show tooltips for all datasets at that x-index
      intersect: false, // Tooltip activates even if not directly hovering point
    },
    scales: {
      // X-axis configuration (assuming labels are categories like dates)
      x: {
        type: 'category', // Or 'time' if labels are actual Date objects and using time adapter
        grid: {
           display: false, // Optionally hide vertical grid lines
        }
      },
      // Y-axis configuration (Primary - for the first dataset, e.g., crypto1)
      y: {
        type: 'linear', // Specify the scale type
        position: 'left',
        ticks: {
           // Optional: Format ticks if needed (e.g., add $)
           // callback: function(value, index, values) {
           //    return '$' + value.toLocaleString();
           // }
        }
      },
      // Conditionally add a second Y-axis if multiAxis is true
      ...(multiAxis && { // Use spread syntax to conditionally add the y1 axis
        y1: { // Use standard ID 'y1' for the second axis
          type: 'linear', // Specify the scale type
          position: 'right',
          grid: {
            drawOnChartArea: false, // Prevent grid lines from overlapping primary axis grid
          },
          ticks: {
             // Optional: Format ticks if needed
             // callback: function(value, index, values) {
             //    return '$' + value.toLocaleString();
             // }
          }
        }
      })
    },
  };

  // IMPORTANT: You need to make sure that when you create the chartData
  // (likely in settingChartData.js), you assign the correct yAxisID
  // to each dataset if multiAxis is true.
  // Example (in settingChartData.js):
  // setChartData({
  //   labels: ...,
  //   datasets: [
  //     { label: 'Crypto1', data: prices1, borderColor: '...', yAxisID: 'y' }, // Uses the 'y' axis
  //     { label: 'Crypto2', data: prices2, borderColor: '...', yAxisID: 'y1' }, // Uses the 'y1' axis
  //   ]
  // })

  return <Line data={chartData} options={options} />;
}

export default LineChart;
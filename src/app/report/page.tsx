'use client';

import { useEffect, useState } from 'react';
import { Box, Grid2 as Grid, Paper, Typography, Alert } from '@mui/material';
import * as d3 from 'd3';
import { useSession } from 'next-auth/react';
import type { ReportData } from '@/types';
import { valueFormatterCurrency } from '@/lib/common';
import CheckUserSessionWrapper from '@/components/common/checkUserSession';

// Chart configuration types
interface ChartConfig {
  selector: string;
  data: any[];
  labelKey: string;
  valueKey: string;
  title: string;
}

// interface TrasfertaData {
//   trasferta: string;
//   progetto?: string;
//   total: number;
//   count: number;
// }

// interface ProgettoData {
//   progetto: string;
//   total: number;
//   count: number;
// }

export default function ReportPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/report', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for sending cookies
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Please log in');
          }
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    if (!data) return;

    // Clear previous charts
    d3.selectAll('.chart-container svg').remove();

    // Define chart configurations
    const chartConfigs: ChartConfig[] = [
      {
        selector: '.categoria-chart',
        data: data.stats.speseByCategoria,
        labelKey: 'categoria',
        valueKey: 'total',
        title: 'Expenses by Category'
      },
      {
        selector: '.trasferta-chart',
        data: data.stats.speseByTrasferta,
        labelKey: 'trasferta',
        valueKey: 'total',
        title: 'Spese per trasferta'
      },
      {
        selector: '.project-chart',
        data: data.stats.speseByProgetto,
        labelKey: 'progetto',
        valueKey: 'total',
        title: 'Spese per progetto'
      }
    ];

    // Add status chart for non-admin users
    if (!session?.user?.is_admin && data.stats.speseByStato) {
      chartConfigs.push({
        selector: '.stato-chart',
        data: data.stats.speseByStato,
        labelKey: 'stato',
        valueKey: 'total',
        title: 'Spese per stato approvazione'
      });
    }

    // Create charts
    chartConfigs.forEach(config => {
      if (config.selector === '.project-chart') {
        createBarChart(config);
      } else {
        createPieChart(config);
      }
    });
  }, [data, session?.user?.is_admin]);

  if (!data) return null;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Report
      </Typography>

      <CheckUserSessionWrapper>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', color: '#3a3a3a' } }>
            <Typography variant="subtitle1" gutterBottom>
              Totale spese
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {valueFormatterCurrency(data.stats.totalSpese)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', color: '#3a3a3a' }}>
            <Typography variant="subtitle1" gutterBottom>
              Budget totale
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {valueFormatterCurrency(data.stats.totalBudget)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: data.stats.totalBudget - data.stats.totalSpese > 0 ? '#e8f5e9' : '#ffebee', color: data.stats.totalBudget - data.stats.totalSpese > 0 ? '#388e3c' : '#d32f2f' }}>
          <Typography variant="subtitle1" gutterBottom>
            Rimanente
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {valueFormatterCurrency(data.stats.totalBudget - data.stats.totalSpese)}
          </Typography>
        </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 440 }}>
            <Typography variant="h6" gutterBottom>
              Spese per categoria
            </Typography>
            <Box className="categoria-chart chart-container" sx={{ height: 360 }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 440 }}>
            <Typography variant="h6" gutterBottom>
              Spese per trasferta
            </Typography>
            <Box className="trasferta-chart chart-container" sx={{ height: 360 }} />
          </Paper>
        </Grid>
        {!session?.user?.is_admin && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2, height: 440 }}>
              <Typography variant="h6" gutterBottom>
                Stato spese
              </Typography>
              <Box className="stato-chart chart-container" sx={{ height: 360 }} />
            </Paper>
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, height: 440 }}>
            <Typography variant="h6" gutterBottom>
              Spese per progetto
            </Typography>
            <Box className="project-chart chart-container" sx={{ height: 360 }} />
          </Paper>
        </Grid>
      </Grid>
      </CheckUserSessionWrapper>
    </Box>
  );
}

function createPieChart({ selector, data, labelKey, valueKey }: ChartConfig) {
  const container = document.querySelector(selector) as HTMLElement;
  if (!container) return;
  const width = container.offsetWidth || 400;
  const height = container.offsetHeight || 400;
  const radius = Math.min(width, height) / 2 - 10;

  const color = d3.scaleOrdinal()
    .range(["#b9d7ea", "#dccdee", "#ebe7c9", "#dce7e2", "#efdfe5", "#d9d9ed", "#e6cdc2", "#dcd7b8", "#c9e2ce", "#e3d4e1", "#a9c9d2", "#f4eaeb"]);

  const pie = d3.pie<any>()
    .value(d => d[valueKey])
    .sort(null);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Remove any previous SVG
  d3.select(selector).selectAll('svg').remove();

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const pieData = pie(data);

  const path = svg.selectAll('path')
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc as any)
    .attr('fill', (d, i) => color(String(i)) as string)
    .attr('stroke', 'white')
    .style('stroke-width', '2px');

  // Add percentage labels
  svg.selectAll('text')
    .data(pieData)
    .enter()
    .append('text')
    .attr('transform', d => `translate(${arc.centroid(d as any)})`)
    .attr('dy', '0.35em')
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .text(d => {
      const percent = d.value / d3.sum(data, d => d[valueKey]);
      return percent > 0.05 ? `${(percent * 100).toFixed(1)}%` : '';
    });

  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${-width/2},${-height / 2 + 20})`); // posizione della legenda
  pieData.forEach((d, i) => {
    legend.append('rect')
      .attr('x', 0)
      .attr('y', i * 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', color(String(i)) as string);
    legend.append('text')
      .attr('x', 18)
      .attr('y', i * 20 + 10)
      .attr('font-size', 12)
      .text(d.data[labelKey]);
  });

  // Add tooltips (one per chart)
  let tooltip = d3.select<HTMLDivElement, unknown>(selector + '-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body')
      .append('div')
      .attr('id', selector.replace('.', '') + '-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
  }

  path.on('mouseover', function(event, d: any) {
    tooltip
      .style('visibility', 'visible')
      .html(`
        <strong>${d.data[labelKey]}</strong><br/>
        Totale: ${valueFormatterCurrency(d.data[valueKey])}<br/>
        N. Spese: ${d.data.count}
      `);
  })
  .on('mousemove', function(event) {
    tooltip
      .style('top', (event.pageY - 10) + 'px')
      .style('left', (event.pageX + 10) + 'px');
  })
  .on('mouseout', function() {
    tooltip.style('visibility', 'hidden');
  });
}

function createBarChart({ selector, data, labelKey, valueKey }: ChartConfig) {
  const container = document.querySelector(selector) as HTMLElement;
  if (!container) return;
  const width = container.offsetWidth || 600;
  const height = container.offsetHeight || 360;
  const margin = { top: 20, right: 30, bottom: 90, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Remove any previous SVG
  d3.select(selector).selectAll('svg').remove();

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .range([0, chartWidth])
    .domain(data.map(d => d[labelKey]))
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[valueKey]) as number])
    .range([chartHeight, 0]);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).tickFormat(d => valueFormatterCurrency(d as number)));

  // Add bars
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d[labelKey]) as number)
    .attr('y', d => y(d[valueKey]))
    .attr('width', x.bandwidth())
    .attr('height', d => chartHeight - y(d[valueKey]))
    .attr('fill', '#90a4ae');

  // Add value labels on top of bars
  svg.selectAll('.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => (x(d[labelKey]) as number) + x.bandwidth() / 2)
    .attr('y', d => y(d[valueKey]) - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('fill', '#333')
    .text(d => valueFormatterCurrency(d[valueKey]));

  // Add tooltips (one per chart)
  let tooltip = d3.select<HTMLDivElement, unknown>(selector + '-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select<HTMLDivElement, unknown>('body')
      .append('div')
      .attr('id', selector.replace('.', '') + '-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
  }

  svg.selectAll('rect')
    .on('mouseover', function(event, d: any) {
      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>${d[labelKey]}</strong><br/>
          Totale: ${valueFormatterCurrency(d[valueKey])}<br/>
          N. Spese: ${d.count}
        `);
    })
    .on('mousemove', function(event) {
      tooltip
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });
} 
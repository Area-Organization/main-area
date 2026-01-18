import { render } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ServiceIcon from '../../src/lib/components/ServiceIcon.svelte';

describe('ServiceIcon', () => {
  it('renders github icon', () => {
    const { container } = render(ServiceIcon, { name: 'github' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders discord icon', () => {
    const { container } = render(ServiceIcon, { name: 'discord' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders gmail icon', () => {
    const { container } = render(ServiceIcon, { name: 'gmail' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders trello icon', () => {
    const { container } = render(ServiceIcon, { name: 'trello' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders spotify icon', () => {
    const { container } = render(ServiceIcon, { name: 'spotify' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders youtube icon', () => {
    const { container } = render(ServiceIcon, { name: 'youtube' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders google drive icon', () => {
    const { container } = render(ServiceIcon, { name: 'google drive' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders notion icon', () => {
    const { container } = render(ServiceIcon, { name: 'notion' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders steam icon', () => {
    const { container } = render(ServiceIcon, { name: 'steam' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('renders dropbox icon', () => {
    const { container } = render(ServiceIcon, { name: 'dropbox' });
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

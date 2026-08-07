import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameStep } from './NameStep';

describe('NameStep', () => {
  it('muestra el título, subtítulo y placeholder exactos', () => {
    render(<NameStep value="" onChange={() => {}} onContinue={() => {}} current={1} total={8} />);
    expect(screen.getByText('Qual seu nome?')).toBeInTheDocument();
    expect(screen.getByText('Vamos personalizar tudo pra você ✨')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu primeiro nome')).toBeInTheDocument();
  });

  it('deshabilita Continuar cuando el valor está vacío', () => {
    render(<NameStep value="" onChange={() => {}} onContinue={() => {}} current={1} total={8} />);
    expect(screen.getByText('CONTINUAR')).toBeDisabled();
  });

  it('llama a onChange al escribir y a onContinue al hacer clic con un valor válido', async () => {
    const onChange = vi.fn();
    const onContinue = vi.fn();
    render(<NameStep value="Ana" onChange={onChange} onContinue={onContinue} current={1} total={8} />);
    await userEvent.type(screen.getByPlaceholderText('Seu primeiro nome'), 'x');
    expect(onChange).toHaveBeenCalled();
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});

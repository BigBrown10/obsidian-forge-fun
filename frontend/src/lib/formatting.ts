
export function formatCompactNumber(number: number | string): string {
    const num = Number(number)
    if (isNaN(num)) return '0'

    const formatter = Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    })

    return formatter.format(num)
}

export function formatCurrency(number: number | string): string {
    const num = Number(number)
    if (isNaN(num)) return '$0'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(num)
}

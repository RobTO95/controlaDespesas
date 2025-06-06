// Adaptado de date-fns/locale/pt-BR para uso direto no navegador
window.ptBR = {
    code: "pt-BR",
    formatDistance: () => "",
    formatLong: {
        date: () => "dd/MM/yyyy",
        time: () => "HH:mm",
        dateTime: () => "dd/MM/yyyy HH:mm",
    },
    formatRelative: () => "",
    localize: {
        ordinalNumber: (n) => String(n),
        era: () => "",
        quarter: () => "",
        month: (n) =>
            [
                "janeiro",
                "fevereiro",
                "março",
                "abril",
                "maio",
                "junho",
                "julho",
                "agosto",
                "setembro",
                "outubro",
                "novembro",
                "dezembro",
            ][n],
        day: (n) =>
            [
                "domingo",
                "segunda-feira",
                "terça-feira",
                "quarta-feira",
                "quinta-feira",
                "sexta-feira",
                "sábado",
            ][n],
        dayPeriod: () => "",
    },
    match: {},
    options: {
        weekStartsOn: 0,
        firstWeekContainsDate: 1,
    },
};

import inquirer from "inquirer"

export const entryPoint = async () => {
    const questions = [
        {
            name: "choice",
            type: "list",
            message: "Действие:",
            choices: [
                {
                    name: "Process multiple swaps",
                    value: "process_multiple_swaps",
                },
                {
                    name: "Warm up swap",
                    value: "warm_up_swap",
                },
            ],
            loop: false,
        },
    ]

    const answers = await inquirer.prompt(questions)
    return answers.choice
}
import { html } from "rhu/html.js";
import { signal } from "rhu/signal.js";
import { Style } from "rhu/style.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    font-family: roboto;
    font-size: 18px;

	margin: auto;
	max-width: 500px;

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: #fff;

    overflow: hidden;
    `;
    const body = css.class`
    flex: 1;
	font-size: 18px;
    `;

    const title = css.class`
    padding: 8px;
	font-size: 24px;
	font-weight: bold;
	text-align: centre;
    `;
	
	const equation = css.class`
	padding: 8px;
	font-size: 18px;
	`;
	
	const bmiDes = css.class`
	padding: 8px;
	font-size: 15px;
	font-style: italic;
	`;

    const list = css.class`
	width: 100%;
	font-size: 18px;
    `;
    
    const item = css.class`
    width: 100%;
	position: relative;
	margin-top: 5px;
    `;

    const input = css.class`
    width: 100%;
    `;

    const result = css.class`
    display: flex;
	flex-direction: column;
    padding: 8 px;
	gap: 8px; 
	font-size: 18px;
	align-items: center;
	justify-content: center;
	height: 80px;
    `;

    const good = css.class`
    background-color: #5fe625;
    color: #fff;
    `;
    const warn = css.class`
    background-color: #ff8324;
    color: #fff;
    `;
    const bad = css.class`
    background-color: #e30538;
    color: #fff;
    `;
	const low = css.class`
    background-color: #fff;
    color: #000;
    `;

    return {
        title,
        wrapper,
        body,
        list,
        item,
        input,
        result,
		equation,
		bmiDes,

        good,
        warn,
        bad
    };
});

const App = () => {
    const result = signal(0);
	const description = signal("");

    const variables = ["Respiratory rate", "Tidal volume", "Peak pressure", "Plateau pressure", "PEEP", "BMI"];
	const units = {
		"Respiratory rate": "breaths/minute",
		"Tidal volume": "ml",
		"Peak pressure": "cmH2O",
		"Plateau pressure": "cmH2O",
		"PEEP": "cmH2O",
		"BMI": "kg/m^2"
	};

    const dom = html`
    <div class="${style.wrapper}">
        <h1 class="${style.title}">Mechanical Power</h1>
		
		<div class="${style.equation}">
			Equation used:  
			"Respiratory rate" * ("Tidal volume"/1000) * (("Peak pressure" * bmiIndex) - (("Plateau pressure" - "PEEP") / 2)) * 0.098
		</div>

	<div class="${style.bmiDes}">
			If BMI <30, bmiIndex = 1 <br> 
			If BMI 30-40, bmiIndex = 0.9 <br>
			If BMI >40, bmiIndex = 0.8
	</div>
			
    <div m-id="body" class="${style.body}">

		<div m-id="table" class="${style.list}">
		</div>
		<div m-id="resultbox" class="${style.result}">
			<span>${result} J/min</span>
			<span>${description}</span>
        </div>

    </div>
	</div>
    `;
	
    html(dom).box();
	
	const variableRanges = {
    "Respiratory rate": { min: 0, max: 40, step: 1 },
    "Tidal volume": { min: 0, max: 800, step: 1 },
    "Peak pressure": { min: 0, max: 40, step: 1 },
    "Plateau pressure": { min: 0, max: 40, step: 1 },
    "PEEP": { min: 0, max: 30, step: 1 },
    "BMI": { min: 0, max: 50, step: 0.1 }
	};

	const $ = {};
    const update = () => {
        for (let v of variables) {
            try {
                 $[v] = parseFloat(dom[v].value);
            } catch {
                $[v] = 0;
            }

            if (isNaN($[v])) {
                $[v] = 0;
            }
        }
		let bmiIndex = 0;
		if ($["BMI"] < 30) {
			bmiIndex = 1;
		} else if ($["BMI"] >= 30 && $["BMI"] <= 40) {
			bmiIndex = 0.9;
		} else if ($["BMI"] > 40) {
			bmiIndex = 0.8;
		}
		
		 let resultValue = 
			$["Respiratory rate"] * 
			($["Tidal volume"] / 1000) * 
			(($["Peak pressure"] * bmiIndex) - (($["Plateau pressure"] - $["PEEP"]) / 2)) * 
			0.098;

		result(parseFloat(resultValue.toFixed(1)));
		//result($["Respiratory rate"] * ($["Tidal volume"]/1000) * ($["Peak pressure"] - (($["Plateau pressure"] - $["PEEP"]) / 2)) * 0.098 * bmiIndex);
	};

    variables.map((v) => {
        const item = html`
        <div class="${style.item}">
			<div style="padding: 8px;">
				<div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">${v}</div>
				<div style="display: flex;">
					<input m-id="inp" type="number" value="${variableRanges[v].min}"/>
					<div style="flex: 1;"></div>
					<span>${units[v] ? units[v] : "unit"} </span>
				</div>
				<div style="width: 100%;">
					<input
						class="${style.input}"
						m-id="${v}"
						type="range"
						min="${variableRanges[v].min}"
						max="${variableRanges[v].max}"
						step="${variableRanges[v].step}"
						value="${variableRanges[v].min}"
						/>
				</div>
			</div>
			<div style="margin-top: 5px; width: 100%; border-bottom-style: solid; border-width: 1px; border-color: #ccc;"></div>
        </div>
        `;
		const inpUpdate = () => {
        let val = parseFloat(item.inp.value);

        // Enforce range constraints
        if (isNaN(val)) val = variableRanges[v].min;
        val = Math.min(Math.max(val, variableRanges[v].min), variableRanges[v].max);

        // Update slider and input values
        item.inp.value = val;
        item[v].value = val;

        // Trigger UI update
        update();
		};
		
		const slidUpdate = () => {
			let val = parseFloat(item[v].value);

			// Enforce range constraints
			if (isNaN(val)) val = variableRanges[v].min;
			val = Math.min(Math.max(val, variableRanges[v].min), variableRanges[v].max);

			// Update number input value
			item.inp.value = val;

			// Trigger UI update
			update();
		};
		
		item.inp.addEventListener("change", inpUpdate);
		item.inp.addEventListener("input", inpUpdate);
		
		item[v].addEventListener("input", slidUpdate);
		item[v].addEventListener("change", slidUpdate);
		
		item[v].addEventListener("input", update);
		item[v].addEventListener("change", update);
		
        dom[v] = item[v];
        dom.table.append(...item);
    });
 
    result.on((v) => {
        dom.resultbox.classList.remove(`${style.good}`);
        dom.resultbox.classList.remove(`${style.bad}`);
        dom.resultbox.classList.remove(`${style.warn}`);
        
        if (v >= 4 && v <= 12) {
            dom.resultbox.classList.add(`${style.good}`);
			description("description 1 here");
        } else if (v >= 12 && v <= 14) {
            dom.resultbox.classList.add(`${style.warn}`);
			description("description 2 here");
		} else if (v >14) {
            dom.resultbox.classList.add(`${style.bad}`);
			description("description 3 here");
        } else {
            dom.resultbox.classList.add(`${style.low}`);
			description("description 4 here");
        }
    })
    
    return dom;
};

export const app = App();

// Load app
const __load__ = () => {
    document.body.replaceChildren(...app);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}

// Map any variable letters to a,b,c,d
function mapVariables(expr) {
    let vars = {};
    let letters = expr.match(/[A-Za-z]/g);
    if (!letters) return expr;
    let map = ['a','b','c','d'];
    let idx = 0;
    letters.forEach(l => {
        l = l.toLowerCase();
        if (!vars[l] && idx < 4) vars[l] = map[idx++];
    });
    return expr.replace(/[A-Za-z]/g, l => vars[l.toLowerCase()]);
}

// Parse expression into a tree
function parseExpr(expr) {
    expr = mapVariables(expr.replace(/\s+/g,''));
    // Tokenize
    let tokens = expr.match(/([a-d]('|’)?|\+|\(|\)|\.)/g);
    if (!tokens) return null;

    // Shunting-yard algorithm to convert to tree
    let output = [];
    let ops = [];
    let precedence = {'+':1, '.':2};
    tokens.forEach(t => {
        if (/[a-d]'?/.test(t)) output.push({type:'var', value:t});
        else if (t==='(') ops.push(t);
        else if (t===')') {
            while (ops.length && ops[ops.length-1] !== '(') output.push({type:'op', value:ops.pop()});
            ops.pop();
        } else { // operator
            while (ops.length && precedence[ops[ops.length-1]] >= precedence[t]) output.push({type:'op', value:ops.pop()});
            ops.push(t);
        }
    });
    while (ops.length) output.push({type:'op', value:ops.pop()});
    return buildTree(output);
}

function buildTree(rpn) {
    let stack = [];
    rpn.forEach(t => {
        if (t.type === 'var') stack.push(t);
        else {
            let b = stack.pop();
            let a = stack.pop();
            stack.push({type:'op', op:t.value, left:a, right:b});
        }
    });
    return stack[0];
}

// Draw tree as SVG
function drawTree(node, x=50, y=50, spacing=100, container) {
    if (!node) return x;
    if (node.type==='var') {
        let txt = document.createElementNS("http://www.w3.org/2000/svg",'text');
        txt.setAttribute('x',x); txt.setAttribute('y',y);
        txt.textContent = node.value;
        container.appendChild(txt);
        return x+spacing;
    } else {
        let gate = document.createElementNS("http://www.w3.org/2000/svg",'text');
        gate.setAttribute('x',x); gate.setAttribute('y',y);
        gate.textContent = node.op==='+' ? 'OR' : 'AND';
        container.appendChild(gate);
        let lx = drawTree(node.left, x, y+50, spacing, container);
        let rx = drawTree(node.right, lx, y+50, spacing, container);
        return rx;
    }
}

function drawLogic() {
    let expr = document.getElementById('expr').value;
    let tree = parseExpr(expr);
    let diagram = document.getElementById('diagram');
    diagram.innerHTML = '';
    let svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    svg.setAttribute('width','100%');
    svg.setAttribute('height','400');
    diagram.appendChild(svg);
    drawTree(tree, 50, 50, 70, svg);
                    }

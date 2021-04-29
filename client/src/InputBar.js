import React, { useState } from 'react'
import './style.css'
import { Grid, Form, Input, Button, Container, Icon } from 'semantic-ui-react'
import MaterialTable from 'material-table'


function InputBar(
    {
        createCharts,
        handleChange,
        dataHeaders,
        data,
        clearGraphs
    }
) {
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(prev => !prev)
    }

    return (
        <>
                
            <div className="StickyTable" style={{display: open? "none":null}}>
                <Container>
                    <MaterialTable columns={dataHeaders} data={data} title='' />
                </Container>
            </div>
            <div className="StickyButton">
                <Grid centered="true">

                    <Button size="tiny" color="teal" icon onClick={handleOpen}>
                        <Icon name="bars" />
                    </Button>
                </Grid>
            </div>

            <div className="StickyInput">

                <Grid centered="true">
                    <Grid.Row>

                    </Grid.Row>
                    <Button onClick={clearGraphs} color="red" icon><Icon name="trash alternate outline" /></Button>

                    <Form onSubmit={createCharts}>
                        <Input placeholder={'...Enter query Here'} onChange={handleChange} size="large" style={{ width: 1000, fontWeight: 50 }} />

                    </Form>
                    <Button size="large" color="teal" onClick={createCharts}>Create Visualization</Button>

                </Grid>
            </div>
        </>
    )
}

export default InputBar